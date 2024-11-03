import { $, createSVG } from '../svg_utils';

export function setup_wrapper(element) {
    let svg_element, wrapper_element;
    
    // CSS Selector is passed
    if (typeof element === 'string') {
        element = document.querySelector(element);
    }

    // get the SVGElement
    if (element instanceof HTMLElement) {
        wrapper_element = element;
        svg_element = element.querySelector('svg');
    } else if (element instanceof SVGElement) {
        svg_element = element;
    } else {
        throw new TypeError(
            'Frappe Gantt only supports usage of a string CSS selector,' +
            " HTML DOM element or SVG DOM element for the 'element' parameter",
        );
    }

    // Creamos un objeto para almacenar los elementos del DOM
    const elements = {
        $svg: null,
        $container: document.createElement('div'),
        $popup_wrapper: document.createElement('div')
    };

    // svg element
    if (!svg_element) {
        // create it
        elements.$svg = createSVG('svg', {
            append_to: wrapper_element,
            class: 'gantt',
        });
    } else {
        elements.$svg = svg_element;
        elements.$svg.classList.add('gantt');
    }

    // wrapper element
    elements.$container.classList.add('gantt-container');

    // parent element
    const parent_element = elements.$svg.parentElement;
    parent_element.appendChild(elements.$container);
    elements.$container.appendChild(elements.$svg);

    // popup wrapper
    elements.$popup_wrapper.classList.add('popup-wrapper');
    elements.$container.appendChild(elements.$popup_wrapper);

    return elements;
}