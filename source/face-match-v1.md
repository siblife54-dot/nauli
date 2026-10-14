# Проба сходства лица v1

Режим: встроенный image_gen, без CLI.

Вход 1 (цель редактирования): assets/nauli-hero-20261014.png.
Вход 2 (исходное лицо Валерии): source/valeria-face-reference.png.

Результат сохранён: C:/Users/User/Documents/ChatGPT/LP - Валерия (Codex)/nauli/assets/nauli-face-reference-v1.png

Чтобы сохранить всё вне лица точно, полное сгенерированное изображение не заменяет фон. На странице видна только его лицевая область через assets/face-blend-v1.svg (центр 497,745, радиусы 105×134 на макете 941×1672). Текст, тело и декор показываются из нетронутого исходного PNG.

Предыдущая версия сохранена тегом before-face-match-20261014 и доступна через ?face=original. Страница compare/ позволяет сравнить исходное фото, прежнее лицо и пробный результат. Степень сходства требует визуальной оценки пользователя; точная фотографическая идентичность не заявляется.

## Точный промпт

Use case: identity-preserve / precise-object-edit.
Image 1 is the EDIT TARGET: the finished 941 x 1672 NAULI landing-page hero with a woman, Russian lettering, peach botanical background and olive button.
Image 2 is the IDENTITY REFERENCE: the original unretouched photograph of the same woman, Valeria, in a black outfit beside white architecture.
Change ONLY the face of the woman in image 1 to match her real face in image 2 as closely as possible. This is a precise identity restoration, not a beautification. Preserve her actual eye shape, eyelids, distance between eyes, brow shape, nose bridge and tip, nostrils, lip shape and mouth opening, cheek structure, chin, jaw, expression and age from image 2. Match her original rightward gaze and natural asymmetry. Do not make eyes bigger, lips fuller, nose smaller or skin plastic. Keep real skin texture. The face must look like the SAME real woman from image 2, not a similar model.
Keep the face at the exact existing position, orientation and scale within image 1. Integrate it with the existing warm, soft lighting; use restrained tone matching only. Preserve the slicked-back hairstyle and ear position and blend naturally into the unchanged neck.
The only editable region is the small head/face area, approximately x=390..592, y=600..867 in the 941x1672 target. Do NOT move or resize the woman, alter her body, shoulders, hands, clothing, jewelry or pose.
Everything outside the face must remain EXACTLY unchanged: entire canvas, crop, layout, all Russian text and letterforms, NAULI title, every leaf, shadow, wave, icon, badge, background color and button. Do not redraw the design. No extra text or objects.
Output the complete edited hero image with the same 941:1672 aspect ratio and full unchanged composition, opaque background.

## Проверка

В мобильном отображении 390 × 844 изменились 8460 пикселей внутри области головы. Вне этой области различий между снимками прежней и новой шапки нет. Переключение «исходник / до / после», просмотр прежней версии и прозрачная маска проверены в браузере.
