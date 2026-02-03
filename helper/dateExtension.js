// dateExtension.js
// Extension to classic Date object for formatting content.
// ==================

/**
 * Date extension for formatting content.
 */
class DateExtension extends Date {
    // convert current date obj to String 20210101 (2021/01/01)
    dateToYMD () {
        const d = this.getDate();
        const m = this.getMonth() + 1;
        const y = this.getFullYear();
        return '' + y + (m <= 9 ? '0' + m : m) + (d <= 9 ? '0' + d : d);
    }

    // convert 20210101 -> formated date 01. Januar 2021
    static customFormatter (date) {
        // between 2000 and 3000
        if (date > 20000000 && date < 30000000) {
            const dateString = `${date}`;
            const yearString = dateString.substr(0, 4);
            const monthString = dateString.substr(4, 2);
            const dayString = dateString.substr(6, 2);

            const customDate = new Date();
            customDate.setMonth(parseInt(monthString) - 1);

            const month = customDate.toLocaleString('de-de', { month: 'long' });
            return `${parseInt(dayString)}. ${month} ${yearString}`;
        } else {
            return undefined;
        }
    }

    // convert 20210101 -> formated date 01. Jan 2021
    static shortCustomFormatter (date) {
        // between 2000 and 3000
        if (date > 20000000 && date < 30000000) {
            const dateString = `${date}`;
            const yearString = dateString.substr(0, 4);
            const monthString = dateString.substr(4, 2);
            const dayString = dateString.substr(6, 2);
            return `${parseInt(dayString)}.${monthString}.${yearString}`;
        } else {
            return undefined;
        }
    }
};

module.exports = DateExtension;
