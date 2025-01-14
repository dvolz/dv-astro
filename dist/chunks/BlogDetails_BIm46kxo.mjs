import { b as createAstro, c as createComponent, r as renderTemplate, m as maybeRenderHead, a as renderComponent } from './astro/server_BdFrvQ4H.mjs';
import 'kleur/colors';
import { a as $$Icon } from './BaseLayout_hcN8E3TP.mjs';
/* empty css                            */

function formatDate(dateString) {
	// Parse the date string into a Date object
	const date = new Date(dateString);

	// Ensure we only work with the date portion and avoid time
	const year = date.getUTCFullYear();
	const month = date.getUTCMonth(); // 0-indexed
	const day = date.getUTCDate();

	// Create a new Date object using just the date (ignoring time)
	const cleanDate = new Date(Date.UTC(year, month, day));

	// Format options for the date
	const options = { year: 'numeric', month: 'long', day: 'numeric' };
	const formattedDate = cleanDate.toLocaleDateString('en-US', options);

	// Determine the ordinal suffix for the day
	const suffix =
		day % 10 === 1 && day !== 11
			? 'st'
			: day % 10 === 2 && day !== 12
			? 'nd'
			: day % 10 === 3 && day !== 13
			? 'rd'
			: 'th';

	// Replace the day with its ordinal suffix
	return formattedDate.replace(/\d+/, `${day}${suffix}`)
}

const $$Astro = createAstro("https://dv-astro.netlify.app/");
const $$BlogDetails = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$BlogDetails;
  const { title, author, description, image, pubDate, tags } = Astro2.props;
  return renderTemplate`${maybeRenderHead()}<div class="blog-details" data-astro-cid-tn6qapib> <div class="date" data-astro-cid-tn6qapib> ${renderComponent($$result, "Icon", $$Icon, { "name": "mdi:calendar-outline", "style": "stroke: var(--text-color); stroke-width: .3;", "data-astro-cid-tn6qapib": true })} <div class="date-inner" data-astro-cid-tn6qapib></div> <p data-astro-cid-tn6qapib>Published on <span data-astro-cid-tn6qapib>${formatDate(pubDate)}</span></p> </div> <div data-astro-cid-tn6qapib> <!-- <ul class="tags">
			{
				tags.map((tag) => (
					<li key={tag}>
						<a href={\`/tags/\${tag}\`} class="line-button">
							{tag}
						</a>
					</li>
				))
			}
		</ul> --> </div> </div> <!-- Display tags -->`;
}, "/Users/dvolz/Sites/dv/dv-astro/src/components/BlogDetails.astro", void 0);

export { $$BlogDetails as $ };
