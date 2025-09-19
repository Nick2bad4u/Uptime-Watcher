# .github Directory

This directory contains GitHub-specific configuration files and templates for the Uptime Watcher repository.

## 📁 Directory Structure

```text
.github/
├── CODEOWNERS                    # Code ownership and review assignments
├── FUNDING.yml                   # GitHub Sponsors configuration
├── dependabot.yml               # Dependabot configuration for dependency updates
├── ISSUE_TEMPLATE/              # Issue templates for bug reports and feature requests
├── PULL_REQUEST_TEMPLATE/       # Pull request templates
├── workflows/                   # GitHub Actions CI/CD workflows
├── codeql/                     # CodeQL security analysis configuration
└── instructions/               # Additional repository instructions
```

## 🔧 Configuration Files

### CODEOWNERS

Automatically assigns reviewers to pull requests based on file paths and ownership rules.

### FUNDING.yml

Enables the "Sponsor" button on the repository for GitHub Sponsors and other funding platforms.

### dependabot.yml

Configures Dependabot to automatically create pull requests for dependency updates.

## 📋 Templates

### Issue Templates

- **bug_report.md** - Template for reporting bugs
- **feature_request.md** - Template for requesting new features
- **custom-issue.md** - Custom issue template

### Pull Request Templates

Multiple templates for different types of contributions:

- Bug fixes
- New features
- Documentation updates
- Quick fixes
- Maintenance tasks

## 🚀 GitHub Actions Workflows

The `workflows/` directory contains numerous automated workflows for:

- **Code Quality**: ESLint, Prettier, StyleLint
- **Security**: CodeQL, DevSkim, Gitleaks, TruffleHog
- **Testing**: Playwright, Stryker mutation testing
- **Documentation**: Spell checking, link validation
- **Build & Deploy**: Application builds, Docusaurus deployment
- **Monitoring**: Dependency audits, vulnerability scanning

## 📝 Usage

These files are automatically used by GitHub when:

- Creating new issues (templates are suggested)
- Creating pull requests (templates are applied)
- Code is pushed (workflows are triggered)
- Pull requests are opened (CODEOWNERS assigns reviewers)

## 🤝 Contributing

When contributing to this repository, please:

1. Use the appropriate issue template for bug reports or feature requests
2. Follow the pull request template guidelines
3. Ensure your changes pass all automated checks
4. Review the CODEOWNERS file to understand who should review your changes

## 🔗 Related Documentation

- [GitHub Documentation](https://docs.github.com/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Code Owners Documentation](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners)
