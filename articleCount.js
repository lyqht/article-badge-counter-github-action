const fs = require('fs')
const core = require('@actions/core');
const path = require('path')
const { makeBadge } = require('badge-maker')

const redirectLink = process.env.redirect_link
const num_articles = process.env.articles_length
const readme_path = process.env.readme_path
const readme_abs_path = path.join(process.env.GITHUB_WORKSPACE, readme_path)
const readmeData = fs.readFileSync(readme_abs_path, 'utf8');

const createBadge = () => {
    //TODO: update these to get from action inputs
    const label = 'technical blog'
    const message_suffix = '%20articles'
    const color = 'green'
    const style = 'flat-square'

    const message = `${num_articles}${message_suffix}`
    const format = {
        label,
        message,
        color,
        style
    }
    const svg = makeBadge(format)
    return svg
}

const buildUpdatedReadme = (prevContent) => {
    // code reused from 
    // https://github.com/gautamkrishnar/blog-post-workflow/blob/eea5d3ccc163c20d69adcbb0b6ca38dbcb532abd/blog-post-workflow.js
    const tagNameInput = core.getInput('comment_tag_name');
    console.log({ tagNameInput })
    const tagToLookFor = tagNameInput ? `<!-- ${tagNameInput}:` : `<!-- ARTICLE_BADGE:`;
    const closingTag = "-->"
    const tagNewlineFlag = core.getInput('tag_post_pre_newline') === 'true';
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

    const badgeSVG = createBadge()
    const newContent = redirectLink
        ? `<a href="${redirectLink}">${badgeSVG}</a>`
        : `${badgeSVG}`

    return [
        prevContent.slice(0, endOfOpeningTagIndex + closingTag.length),
        tagNewlineFlag ? '\n' : '',
        newContent,
        tagNewlineFlag ? '\n' : '',
        prevContent.slice(startOfClosingTagIndex),
    ].join('');
};

const newReadme = buildUpdatedReadme(readmeData);
fs.writeFileSync(readme_abs_path, newReadme);