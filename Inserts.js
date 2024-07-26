// noinspection JSUnresolvedReference

/*
This is code to be inserted into the front page of SWWest.com to change how the menu works
to reduce general load on the system.
 */

function updateMenuItemEvents(div) {

    const link = div.querySelector('a');
    //console.log('updateMenuItemEvents: ' + div.id);
    link.removeEventListener('click', () => {});
    link.addEventListener('click', (e) => {
       // alert('clicked on link: ' + link.innerHTML);
        e.preventDefault();
    });
    link.href="javascript:void(0)";
}

function removeTopMenuRedirects() {
    $('.link').off('click');
    console.log('removeTopMenuRedirects()');
    try {
        const topLevelMenuItems = document.querySelectorAll('.accordionHeader');
        for (let i = 0; i < topLevelMenuItems.length; i++) {
            const div = topLevelMenuItems[i];
            updateMenuItemEvents(div);
        }
        console.log('removeTopMenuRedirects successful.')
    }
    catch (ex) {
        console.error(ex);
    }
}

removeTopMenuRedirects();
