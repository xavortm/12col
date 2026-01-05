// Sliders interactive logic - completely self-contained
// This script handles all slider interactions and visual updates

document.addEventListener('DOMContentLoaded', () => {
	// Get all slider elements
	const slider1 = document.getElementById('slider1') as HTMLInputElement;
	const slider2 = document.getElementById('slider2') as HTMLInputElement;
	const slider3 = document.getElementById('slider3') as HTMLInputElement;

	// Get output elements
	const output1 = document.getElementById('slider1-value') as HTMLOutputElement;
	const output2 = document.getElementById('slider2-value') as HTMLOutputElement;
	const output3 = document.getElementById('slider3-value') as HTMLOutputElement;

	// Get display elements
	const displaySlider1 = document.getElementById('display-slider1');
	const displaySlider2 = document.getElementById('display-slider2');
	const displaySlider3 = document.getElementById('display-slider3');
	const animatedBox = document.getElementById('animated-box') as HTMLElement;

	if (!slider1 || !slider2 || !slider3 || !animatedBox) {
		console.error('Required slider elements not found');
		return;
	}

	// Update function for slider 1 (Range/Size)
	const updateSlider1 = () => {
		const value = slider1.value;
		if (output1) output1.textContent = value;
		if (displaySlider1) displaySlider1.textContent = value;

		// Scale the animated box based on slider value
		const scale = 0.5 + (parseInt(value) / 100) * 1;
		animatedBox.style.transform = `scale(${scale})`;
	};

	// Update function for slider 2 (Color)
	const updateSlider2 = () => {
		const value = slider2.value;
		if (output2) output2.textContent = value;
		if (displaySlider2) displaySlider2.textContent = value;

		// Change background color intensity
		const intensity = parseInt(value);
		animatedBox.style.backgroundColor = `rgba(0, 102, 204, ${intensity / 255})`;
	};

	// Update function for slider 3 (Speed/Rotation)
	const updateSlider3 = () => {
		const value = slider3.value;
		if (output3) output3.textContent = value;
		if (displaySlider3) displaySlider3.textContent = value;

		// Adjust rotation speed
		const speed = parseInt(value);
		animatedBox.style.animationDuration = `${11 - speed}s`;
	};

	// Attach event listeners
	slider1.addEventListener('input', updateSlider1);
	slider2.addEventListener('input', updateSlider2);
	slider3.addEventListener('input', updateSlider3);

	// Add rotation animation
	const style = document.createElement('style');
	style.textContent = `
		@keyframes subtleRotate {
			0% { transform: rotate(0deg) scale(var(--scale, 1)); }
			50% { transform: rotate(2deg) scale(var(--scale, 1)); }
			100% { transform: rotate(0deg) scale(var(--scale, 1)); }
		}
		#animated-box {
			animation: subtleRotate 6s ease-in-out infinite;
		}
	`;
	document.head.appendChild(style);

	// Initialize with current values
	updateSlider1();
	updateSlider2();
	updateSlider3();
});
