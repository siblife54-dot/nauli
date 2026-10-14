"""Keep the approved contour, but deliver one transparent alpha mask for Safari."""
from pathlib import Path
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
