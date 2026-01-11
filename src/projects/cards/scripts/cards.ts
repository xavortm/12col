let clickCounter = 0;

const canClickOnCard = (card: HTMLElement): boolean => {
	return card.dataset.state === "default";
};

const getCardSibling = (card: HTMLElement): HTMLElement => {
	const pairString = card.dataset.pair;
	const allCards = document.querySelectorAll<HTMLElement>(
		`[data-pair="${pairString}"]`,
	);
	return allCards[0] === card ? allCards[1] : allCards[0];
};

const clickSolvesCard = (card: HTMLElement): boolean => {
	const sibling = getCardSibling(card);
	return card.dataset.state === "open" && sibling.dataset.state === "open";
};

const closeOpenCards = () => {
	const openCards = document.querySelectorAll<HTMLElement>(
		'[data-state="open"]',
	);

	openCards.forEach((card) => {
		card.dataset.state = "default";
	});
};

const markCardSolved = (card: HTMLElement) => {
	const sibling = getCardSibling(card);

	card.dataset.state = "solved";
	sibling.dataset.state = "solved";

	card.setAttribute("disabled", "");
	sibling.setAttribute("disabled", "");
};

const handleCardClick = (card: HTMLElement) => {
	clickCounter += 1;

	const sibling = getCardSibling(card);

	if (card.dataset.state === "default") {
		card.dataset.state = "open";
	}

	if (clickCounter == 2) {
		if (clickSolvesCard(card)) {
			markCardSolved(card);
		} else {
			closeOpenCards();
		}

		clickCounter = 0;

		return;
	}
};

document.addEventListener("DOMContentLoaded", () => {
	const cards = document.querySelectorAll<HTMLElement>(
		".cards-grid button[data-state]",
	);

	cards.forEach((card) => {
		card.addEventListener("click", () => {
			if (canClickOnCard(card)) {
				handleCardClick(card);
			}
		});
	});
});
