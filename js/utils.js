// Class Functions
function audioElement(audioSource) {
    this.audio = new Audio();
    this.audioSource = audioSource;
    this.addSource = function(audioSource) {
        const source = document.createElement('source');
        source.setAttribute('type', 'audio/mpeg');
        source.setAttribute('src', audioSource);
        this.audio.append(source);
    }
    this.bypassPermissions = function() {
        console.log('load');
        if (this.hasBypassedPermissions) {
            return;
        }
        this.hasBypassedPermissions = true;
        this.addSource('');
        this.audio.play();
    }
    this.play = function() {
        if (!this.hasBypassedPermissions) {
            return;
        }
        if (!this.audioSourceSet) {
            this.addSource(this.audioSource);
            this.audioSourceSet = true;
        }
        this.audio.play();
    }
}

// Util Functions
const getUrlParams = () => {
    const url = window.location.href;
    var params = {};
    if (!url.includes('#')) {
        return params;
    }
    const hashes = url.slice(window.location.href.indexOf('#') + 1).split('&');
    for(var i = 0; i < hashes.length; i++) {
        const hash = hashes[i].split('=');
        params[hash[0]] = hash[1].toString();
    }
    return params;
};

const RenderType = {
    overwrite: 'overwrite',
    append: 'append',
    prepend: 'prepend'
};

const renderTemplate = (templateId, destinationId, data, renderType = RenderType.overwrite) => {
    var source = $('#' + templateId).html();
    var template = Handlebars.compile(source);
    if (renderType === RenderType.append) {
        $('#' + destinationId).append(template(data));
    } else if (renderType === RenderType.prepend) {
        $('#' + destinationId).prepend(template(data));
    } else {
        $('#' + destinationId).html(template(data));
    }
};

const getDirectory = () => {
    const href = window.location.href;
    return href.substring(0, href.lastIndexOf('/'));
};

const getSplashUrl = path => {
    return getDirectory() + path;
};

const capitalize = string => { 
    return string[0].toUpperCase() + string.slice(1); 
};

const pulse = (selector, duration = 1000) => {
    $(selector).transition('set looping');
    $(selector).transition('pulse', duration + 'ms');
};