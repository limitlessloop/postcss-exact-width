// tooling
import postcss from 'postcss';

function flexDirectionProp(decl) {
	const childSelector = " > *";
	const originalRule = decl.parent;
	const slottedSelector = " > ::slotted(*)";
	const levelTwoRule = postcss.rule({selector: originalRule.selector + childSelector});
	const levelTwoSlotted = postcss.rule({selector: originalRule.selector + slottedSelector});


	if (decl.value === "column") {
		// Add new rules
		originalRule.before(levelTwoRule);
		originalRule.before(levelTwoSlotted);

		levelTwoRule.append(
			`--column-grow: 0;
			 --row-grow: initial;`
		);
		levelTwoSlotted.append(
			`--column-grow: 0;
			 --row-grow: initial;`
		);

		originalRule.walk(i => {i.raws.before = "\n\t";});
		levelTwoRule.walk(i => {i.raws.before = "\n\t";});
		levelTwoSlotted.walk(i => {i.raws.before = "\n\t";});
	}
	if (decl.value === "row") {
		// Add new rules
		originalRule.before(levelTwoRule);
		originalRule.before(levelTwoSlotted);

		levelTwoRule.append(
			`--row-grow: 0;
			 --column-grow: initial;`
		);
		levelTwoSlotted.append(
			`--row-grow: 0;
			 --column-grow: initial;`
		);

		originalRule.walk(i => {i.raws.before = "\n\t";});
		levelTwoRule.walk(i => {i.raws.before = "\n\t";});
		levelTwoSlotted.walk(i => {i.raws.before = "\n\t";});
	}
}

// function flexGrowProp(decl) {
// 	const childSelector = " > *";
// 	const originalRule = decl.parent;
// 	const slottedSelector = " ::slotted(*)";
// 	const levelTwoRule = postcss.rule({selector: originalRule.selector + childSelector});
// 	const levelTwoSlotted = postcss.rule({selector: originalRule.selector + slottedSelector});
//
//
// 	originalRule.prepend(
// 		`--flex-grow: ${decl.value};`
// 	);
//
// 	decl.remove();
//
// 	originalRule.walk(i => {i.raws.before = "\n\t";});
// 	levelTwoRule.walk(i => {i.raws.before = "\n\t";});
// 	levelTwoSlotted.walk(i => {i.raws.before = "\n\t";});
// }

function lengthProp(decl) {
	const childSelector = " > *";
	const originalRule = decl.parent;
	const levelTwoRule = postcss.rule({selector: originalRule.selector + childSelector});

	// let percentage = decl.value.match(/[\d\.]+%/g);
	let prop = decl.prop;
	let oppProp;
	let direction;

	// Check for width or height
	if (prop === "width") {
		oppProp = "height";
		direction = "row";
	}
	else if (prop === "height") {
		oppProp = "width";
		direction = "column";
	}


	// Add new rules
	originalRule.before(levelTwoRule);

	if (decl.value === "shrink") {
		decl.before(
			`--${prop}-grow: 0;
			 flex-grow: 0;
			 display: inline-flex;`
		);
		levelTwoRule.append(
			`--${prop}-grow: initial;`
		);

		decl.remove();
	}
	else if (decl.value === "grow") {
		decl.before(
			`flex-grow: 1;`
		);

		decl.remove();
	}
	else {

		decl.parent.walkDecls(function (newdecl) {
			if (newdecl.prop === "flex-grow") {
				originalRule.prepend(
					`--flex-grow: ${newdecl.value};`
				);

				newdecl.remove();
			}
		});

		decl.before(
			`--${prop}-grow: 0;
			 flex-grow: var(--${direction}-grow, var(--${oppProp}-grow, var(--flex-grow, 0)));
			 flex-shrink: 0;
			 flex-basis: auto !important;`
		);

		levelTwoRule.append(
			`--${prop}-grow: initial;`
		);

	}
	// else {
	// 	decl.before(
	// 		`--width-grow: 0;
	// 		 flex-grow: var(--${direction}-grow, var(--${oppProp}-grow, var(--flex-grow, 0)));
	// 		 flex-shrink: 0;
	// 		 flex-basis: auto !important`
	// 	);
	// 	levelTwoRule.append(
	// 		`--${prop}-grow: initial;`
	// 	);
    //
	// }

	originalRule.walk(i => {i.raws.before = "\n\t";});
	levelTwoRule.walk(i => {i.raws.before = "\n\t";});

}

// plugin
export default postcss.plugin('postcss-exact-width', opts => {
	console.log('opts', opts);

	return function (root) {
		const rootRule = postcss.rule({selector: ":root"});
		root.prepend(rootRule);
		rootRule.append({
			prop: "--row-grow",
			value: "0"
		},{
			prop: "--column-grow",
			value: "initial"
		});
		root.walkDecls(function (decl) {
			if (decl.prop === "flex-direction") {
				flexDirectionProp(decl);
			}
			if (decl.prop === "width" || decl.prop === "height") {
				lengthProp(decl);
			}
		});
	};
});
