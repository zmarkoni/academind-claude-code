# AEM Accessibility Tools & Recommendations

## IDE / Language Support

| Tool                                                | Purpose                                                  |
| --------------------------------------------------- | -------------------------------------------------------- |
| **HTL (Sightly) VS Code extension** by Dirk Rudolph | Syntax highlighting + autocomplete for `.html` HTL files |
| **AEM AEMSync / repo tool**                         | Live file sync between local filesystem and AEM instance |

---

## Linting & Code Quality

| Tool                         | Purpose                                                                                           |
| ---------------------------- | ------------------------------------------------------------------------------------------------- |
| **ESLint** + standard config | JS in `ui.frontend` or clientlibs                                                                 |
| **Stylelint**                | CSS/LESS in clientlibs                                                                            |
| **htl-maven-plugin**         | Compile-time validation of HTL expressions — catches broken `data-sly-*` syntax before deployment |

```xml
<!-- pom.xml -->
<plugin>
  <groupId>org.apache.sling</groupId>
  <artifactId>htl-maven-plugin</artifactId>
</plugin>
```

---

## Accessibility (equivalent to Next.js stack)

| Tool                                  | AEM equivalent of...                                            |
| ------------------------------------- | --------------------------------------------------------------- |
| **axe-core + Playwright/Cypress**     | Same as `@axe-core/playwright` — run against rendered AEM pages |
| **Lighthouse CI**                     | Page-level a11y audits in CI pipeline                           |
| **AEM Accessibility Checker** (Adobe) | Built-in AEM editor a11y scanning                               |

---

## Dev Workflow

| Tool                           | Purpose                                               |
| ------------------------------ | ----------------------------------------------------- |
| **Adobe I/O CLI (`aio`)**      | Cloud Service deploys, content sync                   |
| **AEM as a Cloud Service SDK** | Local AEM quickstart for development                  |
| **`aem-clientlib-generator`**  | Auto-generates `clientlib` config from webpack output |

---

## MCP Note

The **AEM Dev MCP server** configured in Claude Code (`mcp__aem-dev-mcp__*`) provides tools for bundle management, health checks, log search, and Groovy script execution directly from the chat. Very useful for debugging running AEM instances.

---

## Priority Picks (if starting fresh)

1. `htl-maven-plugin` — catches HTL errors at build time
2. `axe-core/playwright` — automated a11y testing against rendered pages
3. HTL VS Code extension — syntax support in editor
4. AEM Dev MCP — live instance debugging from Claude Code
