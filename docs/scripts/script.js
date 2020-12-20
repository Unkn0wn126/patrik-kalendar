/**
 * Creates a standard template for the content
 * @param {object} content 
 * @param {string} author 
 */
function createStandardInnerTemplate(content) {
    let finalString = `<div class="item-container" onscroll="scrolled(event)"><div class="item-container-inner">`;
    if (content.type.includes('message')) {
        for (const part of content.texts) {
            let input = part.replaceAll('\n', '<br>');
            finalString += `<p style="text-align: left;">${input}</p>`;
        }
    }
    if (content.type.includes('video')) {
        for (const part of content.videos) {
            if (part.type == 'local') {
                finalString += `<video class="img-fluid" controls> <source src="${part.path}"> </video>`
            }
            else if (part.type == 'url') {
                finalString += ` <iframe class="img-fluid" src="${part.path}" frameborder="0" allowfullscreen> </iframe>`
            }
        }
    }
    if (content.type.includes('image')) {
        for (const part of content.images) {
            finalString += `<a tabindex="-1" onClick="updateModal(\'${part.path}\', \'${part.width}\', \'${part.height}\')" data-bs-toggle="modal" data-bs-target="#myModal"><img class="img-fluid image-thumbnail" src="${part.path}" height="240"></a>`
        }
    }

    finalString += `<div style="text-align:right; font-weight: bold; padding: 3%">${content.author}</div></div></div>`;

    return finalString;
}

function hideModal(event) {
    let myModalEl = document.getElementById('myModal')
    let modal = bootstrap.Modal.getInstance(myModalEl) // Returns a Bootstrap modal instance

    let link = document.getElementById('modal-image-link');

    if (link == event.target) {
        return;
    }

    modal.hide();
}

function scrolled(e) {
    let myDiv = e.target;
    if (myDiv.offsetHeight + myDiv.scrollTop >= myDiv.scrollHeight) {
        myDiv.className = 'item-container-scrolled';
    } else {
        myDiv.className = 'item-container';
    }
}

/**
 * Manually updates the image tag inside of a modal
 * Kinda hacky, but will get the job done
 * @param {string} data 
 */
function updateModal(data, width, height) {
    let modalImage = document.getElementById('modal-image');
    let modalLink = document.getElementById('modal-image-link')
    modalImage.setAttribute('src', data);
    modalImage.width = width;
    modalImage.height = height;
    modalLink.href = data;
}

/**
 * Assigns a popover with content to a given window
 * @param {string} windowId 
 * @param {object} itemData 
 */
function assignPopover(windowId, itemData) {
    let contentString = createStandardInnerTemplate(itemData);
    tippy(windowId, {
        appendTo: document.body,
        content: contentString,
        offset: ({ placement, reference, popper }) => {
            if (placement === 'top-start') {
                return [50, - 70];
            }
            else if (placement === 'top-end') {
                return [-30, -1 * (popper.height) - (50)];
            }
            else if (placement === 'bottom-end') {
                return [-30, -70];
            }
            else if (placement === 'bottom-start') {
                return [50, -70];
            }
            else if (placement === 'left-start') {
                return [50, -70];
            }
            else if (placement === 'right-start') {
                return [50, -70];
            }
            else {
                return [];
            }
        },
        placement: 'bottom-start',
        allowHTML: true,
        hideOnClick: 'toggle',
        interactive: true,
        trigger: 'click',
        maxWidth: 350,
        theme: 'light',
        arrow: false,
        role: 'popover',
        zIndex: 1040,
        inlinePositioning: true,
        onClickOutside(instance, event) {
            let modal = document.getElementById('myModal');

            if (modal.contains(event.target)) {
                return;
            }

            instance.hide();
        },
        onMount(instance) {
            let myDiv = instance.popper.lastChild.children[0].lastChild;

            if (myDiv.offsetHeight + myDiv.scrollTop >= myDiv.scrollHeight) {
                myDiv.className = 'item-container-scrolled';
            } else {
                myDiv.className = 'item-container';
            }
        },
        popperOptions: {
            anchorEl: 'body',
            strategy: 'fixed',
            modifiers: [
                {
                    name: 'flip',
                    options: {
                        fallbackPlacements: ['bottom-end', 'top-start', 'top-end', 'right-start', 'left-start'],
                    },
                },
                {
                    name: 'preventOverflow',
                    options: {
                        mainAxis: true,
                        altAxis: false,
                        tether: true,
                    },
                },
            ],
        },
    });
}


/**
 * The magic starts here!
 */
fetch("./app_src/data.json")
    .then(response => response.json())
    .then(json => {
        let itemList = json;

        let div = document.getElementById("calendar-main");
        let elemCount = 0;
        let currRow = document.createElement("div");
        currRow.classList.add("row", "row-cols-12", "justify-content-md-center", "align-middle");
        div.appendChild(currRow);

        for (const item of itemList) {
            elemCount++;
            let currId = `item-${elemCount}`;

            currRow.appendChild(createWindowNode(elemCount, currId));

            assignPopover(`#${currId}`, item);
        }

        while (elemCount < 24) {
            elemCount++;

            currRow.appendChild(createWindowNode("", `item-${elemCount}`));
        }
    });

/**
 * Creates a window to click on
 * @param {string} title 
 * @param {string} id 
 */
function createWindowNode(title, id) {
    let element = document.createElement("div");
    element.classList.add("col", "text-left", "p-5", "m-5", "ratio", "ratio-1x1", "calendar_window");
    element.id = id;
    titleElement = document.createElement("p");
    titleElement.innerHTML = title;
    titleElement.classList.add("calendar-number");

    element.appendChild(titleElement);

    return element;
}