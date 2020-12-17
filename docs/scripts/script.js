/**
 * Creates a standard template for the content
 * @param {object} content 
 * @param {string} author 
 */
function createStandardInnerTemplate(content) {
    let finalString = `<div class="item-container">`;
    if (content.type.includes('message')) {
        for (const part of content.texts) {
            let input = part.replaceAll('\n', '<br>');
            finalString += `<p style="text-align: left;">${input}</p>`;
        }
    }
    if (content.type.includes('video')) {
        for (const part of content.videos) {
            if(part.type == 'local'){
                finalString += `<video class="img-fluid" controls> <source src="${part.path}"> </video>`
            }
            else if(part.type == 'url'){
                finalString += ` <iframe class="img-fluid" src="${part.path}" title="description" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen> `
            }
        }
    }
    if (content.type.includes('image')) {
        for (const part of content.images) {
            finalString += `<img class="img-fluid" src="${part.path}" height="240">`
        }
    }

    finalString += `<div style="text-align:right; font-weight: bold; padding: 3%">${content.author}</div></div>`;

    return finalString;
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
        offset: [0, 0],
        placement: 'auto',
        allowHTML: true,
        hideOnClick: 'toggle',
        interactive: true,
        trigger: 'click',
        maxWidth: 350,
        theme: 'light',
        arrow: false,
        role: 'popover',
        inlinePositioning: true,
        onClickOutside(instance, event) {
            instance.hide();
        },
        popperOptions: {
            positionFixed: true,
            strategy: 'fixed',
            modifiers: [
                {
                    name: 'flip',
                    options: {
                        fallbackPlacements: ['bottom', 'right'],
                    },
                },
                {
                    name: 'preventOverflow',
                    options: {
                        altAxis: true,
                        tether: false,
                    },
                },
            ],
        },
    });
}

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