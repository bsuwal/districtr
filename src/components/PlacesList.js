import { html } from "lit-html";
import { until } from "lit-html/directives/until";

export default class PlacesList {
    constructor(places, choosePlace) {
        this.places = places;
        this.choosePlace = choosePlace;
    }
    render() {
        return html`
            <section class="toolbar-section places-list-container">
                <ul class="places-list">
                    ${
                        until(
                            this.places.then(p =>
                                p
                                    .map(place =>
                                        placeItems(place, this.choosePlace)
                                    )
                                    .reduce(
                                        (items, item) => [...items, ...item],
                                        []
                                    )
                            ),
                            ""
                        )
                    }
                </ul>
            </section>
        `;
    }
}

export function placeItems(place, onClick) {
    return place.districtingProblems.map(
        problem => html`
            <li
                class="places-list__item"
                @click="${() => onClick(place, problem)}"
            >
                <div class="place-name">${place.name}</div>
                <div class="place-info">
                    ${problem.numberOfParts} ${problem.plural}
                </div>
            </li>
        `
    );
}
