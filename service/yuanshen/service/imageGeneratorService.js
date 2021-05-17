// imageGeneratorService.js
// create an html page for displaying content
// ==================

const PAGE_WIDTH = 500;

const HTML_HEAD = `
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="X-UA-Compatible" content="ie=edge" />
    <style>

    table, th, td {
        border: 0px solid black;
    }
    body {
        background: rgb(51, 53, 58);
        color: #fff;
        max-width: ${PAGE_WIDTH}px;
    }
    .app {
        max-width: ${PAGE_WIDTH}px;
        padding-left: 5px;
        display: flex;
        flex-direction: row;
        align-items: center;
    }
    .head_title {
        font-weight: bold;
        font-size:1.4rem;
    }
    .head_subtitle {
        font-weight: normal;
        color: #FACB34;
        font-size:1.2rem;
    }
    .img_logo {
        width: 44px;
        height: 44px;
        margin-right: 10px;
    }
    .img_sym_left {
        width: 44px;
        height: 44px;
        margin-left: 5px;
    }
    .img_sym_right {
        width: 44px;
        height: 44px;
        margin-right: 5px;
    }
    .img_figure {
        height: 200px;
        margin-left: 5px;
        margin-right: 5px;
    }
    .text_content {
        font-size:1.2rem;
    }
    </style>
</head>`;

function generateHtmlContent (body) {
    const HTML_BEGIN = `<!DOCTYPE html>
    <html lang="en">`;
    const HTML_END = '</html>';

    return HTML_BEGIN + HTML_HEAD + body + HTML_END;
}

function generateBodyContent (content) {
    const BODY_BEGIN = `<body>
    <div class="app">`;
    const BODY_END = `</div>
    </body>`;

    return BODY_BEGIN + content + BODY_END;
}
function generateTableContent (rows) {
    const TABLE_BEGIN = '<table>\n';
    const TABLE_END = '</table>\n';

    return TABLE_BEGIN + rows + TABLE_END;
}

function generateTableRowContent (rows) {
    const TABLE_BEGIN = '<tr>';
    const TABLE_END = '</tr>';

    return TABLE_BEGIN + rows + TABLE_END;
}

function generateColumnTextWith (colspan, classname, content) {
    return `<td colspan="${colspan}"><a class="${classname}">${content}</a></td>`;
}

function generateColumnImgWith (colspan, classname, content) {
    return `<td colspan="${colspan}"><img class="${classname}" src="${content}" /></td>`;
}

function getRating (number) {
    let stars = '';

    for (let i = 0; i < number; i++) {
        const newLocal = '★';
        stars = stars + newLocal;
    }
    return stars;
};

const generateFigureOverviewPage = (figureList) => {
    let titles = '';
    let ratings = '';
    let figures = '';

    let footer = '';

    for (let index = 0; index < figureList.length; index++) {
        const fig = figureList[index];
        titles = titles + generateColumnTextWith(2, 'head_title', fig.name) + '\n';
        ratings = ratings + generateColumnTextWith(2, 'head_subtitle', getRating(fig.rarity)) + '\n';
        figures = figures + generateColumnImgWith(2, 'img_figure', fig.image_url) + '\n';

        footer = footer + generateColumnImgWith(1, 'img_sym_left', fig.element_image_url) + '\n' + generateColumnImgWith(1, 'img_sym_right', fig.weapon_type_image_url) + '\n';
    }

    return generateHtmlContent(generateBodyContent(generateTableContent(generateTableRowContent(titles) + generateTableRowContent(ratings) + generateTableRowContent(figures) + generateTableRowContent(footer))));
};

const generateFigureContentPage = (figure, weekdays) => {
    const materialName = figure.material_name;

    // MATERIAL
    let materialContent = '';
    if (materialName !== undefined && materialName !== '') {
        const materialImageUrl = figure.material_image_url;

        materialContent = `
        <tr>
            <td colspan="4">
                <a class="head_title">Material</a>
            </td>
        </tr>
        <tr>
            <td>
            <img class="img_logo" src="${materialImageUrl}" />
            </td>
            <td class="text_content">${materialName}</td>
        </tr>`;
    }

    // WEAPON
    const weaponType = figure.weapon;
    const weaponTypeImg = figure.wp_type_image_url;

    let weaponTypeHeader = '';
    let weaponTypeContent = '';
    if (weaponType !== undefined && weaponType !== '') {
        weaponTypeHeader = '<td width="50%" colspan="2"><a class="head_title">Waffe</a></td>';

        if (weaponTypeImg !== undefined && weaponTypeImg !== '') {
            weaponTypeContent = `<td><img class="img_logo" src="${weaponTypeImg}" /></td><td class="text_content">${weaponType}</td>`;
        }
    }

    // TALENT
    const talent = figure.talent;
    let talentDays = '';

    if (weekdays != null && weekdays.length > 0) {
        let weekdaysnames = null;

        for (let days = 0; days < weekdays.length; days++) {
            if (weekdaysnames == null) {
                weekdaysnames = weekdays[days].weekday_short;
            } else {
                weekdaysnames = `${weekdaysnames}, ${weekdays[days].weekday_short}`;
            }
        }
        talentDays = weekdaysnames;
    }

    let talentHeader = '';
    let talentContent = '';

    if (talent !== undefined && talent !== '') {
        const talentImg = figure.talent_image_url;
        talentHeader = `<td width="50%" colspan="2"><a class="head_title">Talent [${talentDays}]</a></td>`;

        if (weaponTypeImg !== undefined && weaponTypeImg !== '') {
            talentContent = `<td><img class="img_logo" src="${talentImg}" /></td><td class="text_content">${talent}</td>`;
        }
    }

    // WEEKLY BOSS
    let weeklyBossContent = '';

    if (figure.boss !== undefined && figure.boss !== '') {
        const weeklyBoss = figure.boss + ' / ' + figure.boss_description;
        const weeklyBossImg = figure.boss_image_url;

        const weeklyBossDrop = figure.boss_drop;
        const weeklyBossDropImg = figure.boss_drop_image_url;

        weeklyBossContent = `
        <tr>
            <td colspan="4">
                <a class="head_title">Wochenboss</a>
            </td>
        </tr>
        <tr>
            <td>
            <img class="img_logo" src="${weeklyBossImg}" />
            </td>
            <td class="text_content">${weeklyBoss}</td>
            <td>
            <img class="img_logo" src="${weeklyBossDropImg}" />
            </td>
            <td class="text_content">${weeklyBossDrop}</td>
        </tr>`;
    }

    // combine all items
    const content = `<table>
    <tr>
        ${weaponTypeHeader}
        ${talentHeader}
    </tr>
    <tr>
        ${weaponTypeContent}
        ${talentContent}
    </tr>
    ${materialContent}
    ${weeklyBossContent}
    </table>`;

    return generateHtmlContent(generateBodyContent(content));
};

// export
module.exports = {
    generateFigureContentPage,
    generateFigureOverviewPage
};
