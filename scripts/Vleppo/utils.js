function getDateAndTime() {
    let a = new Date();
    let year = a.getUTCFullYear();
    let month = (a.getUTCMonth() + 1) < 10 ? '0' + (a.getUTCMonth() + 1) : (a.getUTCMonth() + 1);
    let date = a.getUTCDate() < 10 ? '0' + a.getUTCDate() : a.getUTCDate();
    let hour = a.getUTCHours() < 10 ? '0' + a.getUTCHours() : a.getUTCHours();
    let min = a.getUTCMinutes() < 10 ? '0' + a.getUTCMinutes() : a.getUTCMinutes();
    let sec = a.getUTCSeconds() < 10 ? '0' + a.getUTCSeconds() : a.getUTCSeconds();
    let time = date + '/' + month + '/' + year + ' ' + hour + ':' + min + ':' + sec;
    return time;
}