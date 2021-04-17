// yuanshenImgGenerator.js
// create an img for displaying content
// ==================

const HTML_HEAD = `
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="X-UA-Compatible" content="ie=edge" />
    <style>
    body {
        background: rgb(51, 53, 58);
        color: #fff;
        max-width: 300px;
    }
    .app {
        max-width: 300px;
        padding-left: 5px;
        display: flex;
        flex-direction: row;
        align-items: center;
    }
    .head_title {
        font-weight: bold;
        font-size:0.9rem;
    }
    .img_logo {
        width: 25px;
        height: 25px;
        margin-right: 10px;
    }
    .text_content {
        font-size:0.75rem;
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

const generateFigureImgHtml = (figure, weekdays) => {
    const materialName = figure.material_name;

    var materialContent = '';
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

    const weaponType = figure.weapon;
    const weaponTypeImg = figure.wp_type_image_url;

    let weaponTypeHeader = '';
    let weaponTypeContent = '';
    if (weaponType !== undefined && weaponType !== '') {
        weaponTypeHeader = '<td colspan="2"><a class="head_title">Waffe</a></td>';

        if (weaponTypeImg !== undefined && weaponTypeImg !== '') {
            weaponTypeContent = `<td><img class="img_logo" src="${weaponTypeImg}" /></td><td class="text_content">${weaponType}</td>`;
        }
    }

    const talent = figure.talent;
    var talentDays = '';

    if (weekdays != null && weekdays.length > 0) {
        var weekdaysnames = null;

        for (var days = 0; days < weekdays.length; days++) {
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
        talentHeader = `<td colspan="2"><a class="head_title">Talent [${talentDays}]</a></td>`;

        if (weaponTypeImg !== undefined && weaponTypeImg !== '') {
            talentContent = `<td><img class="img_logo" src="${talentImg}" /></td><td class="text_content">${talent}</td>`;
        }
    }

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
    generateFigureImgHtml
};
