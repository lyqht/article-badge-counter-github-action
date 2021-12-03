# article-count-workflow

This GitHub action workflow aims to help you to create an article badge counter like this to showcase on your profile that you are more than just a developer 😉 Users can click it and be redirected to a website of your choice. 

The default badge looks something like this.


<a href="https://esteetey.dev/"><img alt="Website" src="https://img.shields.io/website?label=blog 📝&up_message=18 articles&url=https://esteetey.dev/"></img></a>

## What it does

This workflow is a composite action:

- The number of articles is retrieved using the [blog-post-workflow](https://github.com/gautamkrishnar/blog-post-workflow) action.
- The badge is generated using Shields.io, which are not clickable by default.
- This action has a script to take in your inputs to create a customized clickable badge.
- The commit and push github actions to your repo are performed by the [git-auto-commit workflow](https://github.com/stefanzweifel/git-auto-commit-action)

## How to use

If you are new to GitHub Actions, refer to [this section](#if-you-dont-have-an-existing-github-action-workflow-for-your-repository). Otherwise, you can get started by referring to to the example given and the input options available.

### Example

This is an example retrieved from the `article-badge.yml` that I declared to generate the badge on [my profile](https://github.com/lyqht).

```yml
name: Article Counter Badge Workflow
on:
  schedule:
    - cron: '*/60 * * * *'
  workflow_dispatch:

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: lyqht/article-badge-counter-workflow@main
        with:
          feed_list: "https://esteetey.dev/rss.xml"
          redirect_link: "https://esteetey.dev/"
          tag_post_pre_newline: true
          readme_path: "README.md"
          badge_style: flat
          badge_label: "technical blog 📝"
          badge_message_suffix: "articles"
          badge_message_bg_color: "#abcbca"
```

And add the corresponding `comment_tag_name` on the `README.md`

```
<!-- ARTICLE_BADGE:START -->
Your badge will be populated here by the Github action!
<!-- ARTICLE_BADGE:END -->
```

Generated Badge

<a href="https://esteetey.dev/"><img alt="Website" src="https://img.shields.io/website?label=technical blog 📝&up_message=18 articles&url=https://esteetey.dev/&style=flat&up_color=%23abcbca&"></img></a>

## Input Options

The list of inputs below are retrieved from the workflow's [action.yml](https://github.com/lyqht/article-badge-counter-workflow/blob/main/action.yml). Basically, **every input except for `feed_list` is optional** if you don't plan to customize the default badge style and look. If you are not sure how to get RSS for your blog on community platforms e.g. Dev.to, Hashnode, please refer to [this section](https://github.com/gautamkrishnar/blog-post-workflow#popular-sources) written on the blog-post-workflow action's README.

```yml
inputs:
  feed_list:
    description: "Comma separated list of RSS feed urls"
    required: true
  gh_token:
    description: "GitHub access token with Repo scope"
    required: false
    default: ${{ github.token }}
  redirect_link:
    description: "Link to redirect user when they click on the badge. If not provided, the badge will not be a clickable."
    required: false
  readme_path:
    description: "Path of the readme file you want to update"
    default: README.md
    required: false
  comment_tag_name:
    description: "Override the default comment tag name, if you want to show multiple instances of the action on the same repo"
    default: ARTICLE_BADGE
    required: false
  tag_post_pre_newline:
    description: "To append with newline or not"
    default: "false"
    required: false
  badge_style:
    description: "Style of badge to be applied, refer to Shields.io website for the styles they offer"
    default: 'flat-square'
    required: false
  badge_label:
    description: "Text to be shown on the left side of the badge (label)"
    default: blog
    required: false
  badge_logo:
    description: "Logo to be shown on the left side of the badge (label)"
    default: ""
    required: false
  badge_message_suffix:
    description: "Text to be appended as suffix to the right side of the badge (message). For example, a suffix of 'pieces' will result in a message showing '20 pieces'"
    default: articles
    required: false
  badge_message_bg_color:
    description: "Background color of the right side of the badge (message). Accepts colors like 'green', hex values like '#F9D3C6'"
    default: "green"
    required: false
```


**Use case considerations:**
- Using Emoji: 
  - if you're want to include emoji in the label or message suffix, please make sure that they're enclosed in quotes. Otherwise the GitHub Action will not pick up the emoji.
- If you are an author that cross-post to multiple platforms
  - the action is able to take in a list of RSS, thanks to the blog-post-workflow.
- If you don't want the user to be redirected to a specific link when they click on the badge
  - You can choose to not pass in a `redirect_link`, then the badge will not be clickable.

---

### If you don't have an existing GitHub Action workflow for your repository

1. Create a folder `.github/workflows` if you don't have it already 
2. Inside that folder, create a YAML file say `article-badge.yml`
3. In the `article-badge.yml` file, you can copy the example above and modify it to your usage.
4. You can choose to declare the `schedule` with a cron expression to run the job at a specified frequency e.g. every day once.

