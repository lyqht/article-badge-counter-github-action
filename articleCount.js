const fs = require('fs')
const core = require('@actions/core');
const redirectLink = core.getInput('redirect_link')
const articles = core.getInput('articles')
const num_articles = articles.length
console.log(typeof articles )
console.log({num_articles})
const readmeData = fs.readFileSync(core.getInput('readme_path'), 'utf8');

const buildUpdatedReadme = (prevContent) => {
    // code reused from 
    // https://github.com/gautamkrishnar/blog-post-workflow/blob/eea5d3ccc163c20d69adcbb0b6ca38dbcb532abd/blog-post-workflow.js
    const tagNameInput = core.getInput('comment_tag_name');
    const tagToLookFor = tagNameInput ? `<!-- ${tagNameInput}:START` : `<!-- ARTICLE_BADGE:START -->`;
    const closingTag = tagNameInput ? `<!-- ${tagNameInput}:END` : `<!-- ARTICLE_BADGE:END -->`;
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
            `Cannot find the comment tag on the readme:\n${tagToLookFor}:START -->\n${tagToLookFor}:END -->`
        );
        process.exit(1);
    }

    const encodedURI = redirectLink ? encodeURI(redirectLink) : 'https%3A%2F%2Festeetey.dev'
    const newContent = `[![Website](https://img.shields.io/website?label=technical%20blog📝&up_color=%23abcbca&up_message=${num_articles}%20articles&url=${encodedURI})](${redirectLink})`

    return [
        previousContent.slice(0, endOfOpeningTagIndex + closingTag.length),
        tagNewlineFlag ? '\n' : '',
        newContent,
        tagNewlineFlag ? '\n' : '',
        previousContent.slice(startOfClosingTagIndex),
    ].join('');
};

const newReadme = buildUpdatedReadme(readmeData);

fs.writeFileSync(README_FILE_PATH, newReadme);
