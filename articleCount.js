const fs = require('fs')
const core = require('@actions/core');
const path = require('path')

const createBadge = () => {
    const style = process.env.badge_style
    const label = process.env.badge_label
    const message_bg_color = process.env.badge_message_bg_color
    const message_suffix = process.env.badge_message_suffix
    const num_articles = process.env.articles_length
    const message = `${num_articles} ${message_suffix}`
    
    const redirectLink = process.env.redirect_link
    const encodedURI = redirectLink ? encodeURI(redirectLink) : 'https%3A%2F%2Festeetey.dev' // need a valid query url even if user does not give a redirect link

    const badgeImgElement = `<img alt="Website" src="https://img.shields.io/website?label=${label}&up_message=${message}&url=${encodedURI}&style=${style}&up_color=${message_bg_color}"></img>`
    const badge = redirectLink
        ? `<a href="${redirectLink}">${badgeImgElement}</a>`
        : badgeImgElement

    return badge
}

const buildUpdatedReadme = (prevContent) => {
    // code reused from 
    // https://github.com/gautamkrishnar/blog-post-workflow/blob/eea5d3ccc163c20d69adcbb0b6ca38dbcb532abd/blog-post-workflow.js
    const tagNameInput = process.env.comment_tag_name;
    const tagToLookFor = tagNameInput ? `<!-- ${tagNameInput}:` : `<!-- ARTICLE_BADGE:`;
    const closingTag = "-->"
    const tagNewlineFlag = process.env.tag_post_pre_newline;
    const startOfOpeningTagIndex = prevContent.indexOf(
        `${tagToLookFor}START`,
    );
    const endOfOpeningTagIndex = prevContent.indexOf(
        closingTag,
        startOfOpeningTagIndex,
    );
    const startOfClosingTagIndex = prevContent.indexOf(
        `${tagToLookFor}END`,
        endOfOpeningTagIndex,
    );
    if (
        startOfOpeningTagIndex === -1 ||
        endOfOpeningTagIndex === -1 ||
        startOfClosingTagIndex === -1
    ) {
        // Exit with error if comment is not found on the readme
        core.error(
            `Cannot find the comment tag on the readme:\n${tagToLookFor}START -->\n${tagToLookFor}END -->`
        );
        process.exit(1);
    }

    return [
        prevContent.slice(0, endOfOpeningTagIndex + closingTag.length),
        tagNewlineFlag ? '\n' : '',
        createBadge(),
        tagNewlineFlag ? '\n' : '',
        prevContent.slice(startOfClosingTagIndex),
    ].join('');
};

const readme_path = process.env.readme_path
const readme_abs_path = path.join(process.env.GITHUB_WORKSPACE, readme_path)
const readmeData = fs.readFileSync(readme_abs_path, 'utf8');

const newReadme = buildUpdatedReadme(readmeData);
fs.writeFileSync(readme_abs_path, newReadme);