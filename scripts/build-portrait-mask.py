"""Refine the original traced outline without changing the photograph's pixels."""
from pathlib import Path
import json
import math
import re
import xml.etree.ElementTree as ET

root = Path(__file__).resolve().parents[1]
namespace = 'http://www.w3.org/2000/svg'
ET.register_namespace('', namespace)

def tag(name):
    return '{' + namespace + '}' + name

svg = ET.parse(root / 'source/black-outfit-portrait/portrait-mask-luminance.svg').getroot()
defs = svg.find(tag('defs'))
path = svg.find(tag('path'))
assert defs is not None and path is not None

def distance_to_segment(point, start, end):
    dx, dy = end[0] - start[0], end[1] - start[1]
    length_squared = dx * dx + dy * dy
    if not length_squared:
        return math.dist(point, start)
    t = max(0, min(1, ((point[0] - start[0]) * dx +
                      (point[1] - start[1]) * dy) / length_squared))
    return math.dist(point, (start[0] + t * dx, start[1] + t * dy))

def simplify(points, tolerance=.85):
    """Remove pixel stair steps within a subpixel distance of the traced edge."""
    if len(points) < 3:
        return points
    distances = [distance_to_segment(p, points[0], points[-1]) for p in points[1:-1]]
    farthest = max(range(len(distances)), key=distances.__getitem__)
    if distances[farthest] <= tolerance:
        return [points[0], points[-1]]
    pivot = farthest + 1
    return simplify(points[:pivot + 1], tolerance)[:-1] + simplify(points[pivot:], tolerance)

def smooth_outline(original):
    points = [(float(x), float(y)) for x, y in re.findall(r'[ML]([\d.]+) ([\d.]+)', original)]
    # Split the closed outline at its farthest vertex before simplifying.
    opposite = max(range(len(points)), key=lambda i: math.dist(points[0], points[i]))
    points = (simplify(points[:opposite + 1])[:-1] +
              simplify(points[opposite:] + points[:1])[:-1])
    corners = []
    for i, point in enumerate(points):
        previous, following = points[i - 1], points[(i + 1) % len(points)]
        before, after = math.dist(point, previous), math.dist(point, following)
        # Bounded quadratic corners smooth the trace, not the face/body shape.
        radius = min(before * .28, after * .28, 4.0 if point[0] > 540 and 580 < point[1] < 890 else 2.0)
        enter = tuple(point[j] + (previous[j] - point[j]) * radius / before for j in (0, 1))
        leave = tuple(point[j] + (following[j] - point[j]) * radius / after for j in (0, 1))
        corners.append((enter, point, leave))
    def pair(p):
        return f'{p[0]:.3f} {p[1]:.3f}'
    result = ['M' + pair(corners[0][0])]
    for enter, point, leave in corners:
        result.extend(['L' + pair(enter), 'Q' + pair(point) + ' ' + pair(leave)])
    return ' '.join(result) + ' Z'

contours = json.loads((root / 'source/black-outfit-portrait/contours.json').read_text())
path.set('d', ' '.join(smooth_outline(contour) for contour in contours))
# A narrow defringe removes the cool background spill. Feather only the alpha,
# never the portrait RGB; preserve crisp eyes, hair, skin and clothing detail.
edge = defs.find(tag('filter'))
edge.clear()
edge.attrib.update({'id': 'edge', 'x': '-2%', 'y': '-2%', 'width': '104%',
                    'height': '104%', 'color-interpolation-filters': 'sRGB'})
ET.SubElement(edge, tag('feMorphology'), {'operator': 'erode', 'radius': '.38'})
ET.SubElement(edge, tag('feGaussianBlur'), {'stdDeviation': '.7'})
# The old opaque black rectangle only worked in CSS luminance mode. Keeping
# the outside genuinely transparent avoids the iOS WebKit luminance bug.
for rectangle in list(svg.findall(tag('rect'))):
    svg.remove(rectangle)

gradient = ET.SubElement(defs, tag('linearGradient'), {
    'id': 'portrait-fade', 'gradientUnits': 'userSpaceOnUse',
    'x1': '112', 'y1': '312', 'x2': '112', 'y2': '1280',
})
for offset, opacity in [('0%', '1'), ('70%', '1'), ('75%', '.9'),
                        ('84%', '.3'), ('89%', '0'), ('100%', '0')]:
    ET.SubElement(gradient, tag('stop'), {
        'offset': offset, 'stop-color': 'white', 'stop-opacity': opacity,
    })
fade = ET.SubElement(defs, tag('mask'), {
    'id': 'portrait-fade-alpha', 'maskUnits': 'userSpaceOnUse',
    'maskContentUnits': 'userSpaceOnUse', 'x': '112', 'y': '312',
    'width': '663', 'height': '968', 'mask-type': 'alpha',
    'style': 'mask-type:alpha',
})
ET.SubElement(fade, tag('rect'), {
    'x': '112', 'y': '312', 'width': '663', 'height': '968',
    'fill': 'url(#portrait-fade)',
})
svg.remove(path)
group = ET.SubElement(svg, tag('g'), {'mask': 'url(#portrait-fade-alpha)'})
group.append(path)
ET.ElementTree(svg).write(root / 'dist/assets/valeria-black-mask-alpha.svg',
                         encoding='utf-8', xml_declaration=False)
