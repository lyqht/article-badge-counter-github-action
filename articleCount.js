const fs = require('fs')
const core = require('@actions/core');
const path = require('path')
const redirectLink = process.env.redirect_link
const num_articles = process.env.articles_length
const readme_path = process.env.readme_path
const readme_abs_path = path.join(process.env.GITHUB_WORKSPACE, readme_path)
console.log({ num_articles, readme_path, readme_abs_path })

const readmeData = fs.readFileSync(readme_abs_path, 'utf8');

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

    const encodedURI = redirectLink ? encodeURI(redirectLink) : 'https%3A%2F%2Festeetey.dev'
    const newContent = redirectLink
        ? `<a href=""><img alt="Website" src="https://img.shields.io/website?label=technical%20blog📝&up_message=${num_articles}%20articles&url=${encodedURI}"></img></a>`
        : `<img alt="Website" src="https://img.shields.io/website?label=technical%20blog📝&up_message=${num_articles}%20articles&url=${encodedURI}"></img>`

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