# Available Tools and Their Best Uses

This document outlines the tools available to Roo and provides guidance on their optimal usage.

## Built-in Tools

These tools are part of Roo's core capabilities and operate relative to the current workspace directory (`c:/Users/tehre/Desktop/VisualStudioCodeWorkspace/liftmate-app`) unless otherwise specified.

### `read_file`
- **Description:** Reads the contents of a file.
- **Best Use:** Examining the content of a single file, analyzing code, reviewing configuration files, or extracting information from text-based files. Can read specific line ranges for efficiency with large files.

### `fetch_instructions`
- **Description:** Fetches instructions for specific tasks (e.g., creating an MCP server or mode).
- **Best Use:** Obtaining detailed guidance on complex internal operations.

### `search_files`
- **Description:** Performs a regex search across files in a directory, providing context.
- **Best Use:** Finding specific code patterns, identifying usage of functions/variables, locating TODO comments, or searching for text within multiple files. Useful for understanding codebase structure and identifying areas for changes.

### `list_files`
- **Description:** Lists files and directories within a specified path. Can be recursive.
- **Best Use:** Exploring directory structures, understanding project layout, finding files when the exact path is unknown, and navigating the filesystem.

### `list_code_definition_names`
- **Description:** Lists code definition names (classes, functions, methods) from source files in a path.
- **Best Use:** Gaining a high-level overview of the code structure within a file or directory, understanding the main components and their relationships.

### `apply_diff`
- **Description:** Replaces existing code using search and replace blocks with line number references.
- **Best Use:** Making precise, targeted modifications to existing files, especially for small to medium-sized changes where line numbers are stable.

### `write_to_file`
- **Description:** Writes content to a file, overwriting it if it exists or creating it if it doesn't.
- **Best Use:** Creating new files or completely replacing the content of existing files. Use with caution as it overwrites without warning.

### `append_to_file`
- **Description:** Appends content to the end of a file.
- **Best Use:** Adding new data entries, log messages, or content to the end of existing files without affecting the original content.

### `insert_content`
- **Description:** Inserts content at specific line positions in a file.
- **Best Use:** Adding new code blocks (functions, methods, imports), inserting lines into existing structures, or adding content precisely within a file. Preferred over `write_to_file` for adding content to existing files.

### `search_and_replace`
- **Description:** Performs search and replace operations on a file using string or regex patterns.
- **Best Use:** Finding and replacing specific text or patterns within a file, with options for line ranges and regex flags. Useful for consistent text changes or refactoring variable names.

### `execute_command`
- **Description:** Executes a CLI command on the system.
- **Best Use:** Performing system operations, running build commands, installing dependencies, executing scripts, or interacting with the operating system. Commands should be tailored to the user's system and can specify a working directory.

### `use_mcp_tool`
- **Description:** Uses a tool provided by a connected MCP server.
- **Best Use:** Leveraging specialized capabilities provided by MCP servers that go beyond standard file or command operations, such as interacting with external APIs, performing specific data transformations, or utilizing specialized processing.

### `access_mcp_resource`
- **Description:** Accesses a resource provided by a connected MCP server.
- **Best Use:** Retrieving data or information exposed as resources by MCP servers, such as file contents from a restricted filesystem server or data from a specialized data source.

### `ask_followup_question`
- **Description:** Asks the user a question to gather necessary information.
- **Best Use:** Resolving ambiguity in the task requirements, obtaining missing parameters for tools, or clarifying objectives when research is insufficient. Should be used sparingly and include suggested answers.

### `attempt_completion`
- **Description:** Presents the result of the task to the user.
- **Best Use:** Signaling that the task is complete and providing a summary of the work done. Can optionally include a command to demonstrate the result.

### `switch_mode`
- **Description:** Requests to switch to a different mode.
- **Best Use:** Transitioning to a mode better suited for the current sub-task (e.g., switching to 'code' mode for implementation).

### `new_task`
- **Description:** Creates a new task with a specified starting mode and initial message.
- **Best Use:** Initiating a completely new, separate task within a different mode.

## Choosing the Right Tool

When deciding which tool to use, consider the following:

- **Task Type:** Is it a file operation, command execution, web interaction, research, or something else?
- **Location:** Is the target file/resource local (within the workspace or allowed filesystem paths) or remote (GitHub, a website)?
- **Specificity:** Do you need to read a whole file, search for a pattern, or make a precise line-based edit?
- **Safety:** Prefer structured tools (like Git MCP tools or filesystem MCP tools within allowed paths) over raw `execute_command` when possible, as they often provide better error handling and safety checks.
- **Efficiency:** For multiple file reads, `read_multiple_files` is more efficient than multiple `read_file` calls. For adding content to existing files, `insert_content` or `append_to_file` are generally better than `write_to_file`.
- **MCP Capabilities:** Does an MCP server offer a specialized tool that is a direct fit for the task (e.g., `brave_web_search` for research, `puppeteer_navigate` for web interaction)?

Always refer back to this document and the tool descriptions to select the most appropriate tool for the job.

## MCP Server Tools

These tools are provided by connected MCP servers and offer specialized functionalities.

### `github.com/zcaceres/markdownify-mcp`
- **Tools:** `audio-to-markdown`, `bing-search-to-markdown`, `docx-to-markdown`, `get-markdown-file`, `image-to-markdown`, `pdf-to-markdown`, `pptx-to-markdown`, `webpage-to-markdown`, `xlsx-to-markdown`, `youtube-to-markdown`
- **Best Use:** Converting various content types (audio, search results, documents, images, webpages, spreadsheets, videos) into Markdown format for easier processing and analysis.

### `screen-capture`
- **Tools:** `capture_screen`, `list_displays`
- **Best Use:** Capturing screenshots of the user's screen or listing available displays. Useful for visual debugging or documentation.

### `desktop-automation`
- **Tools:** `get_screen_size`, `screen_capture`, `keyboard_press`, `keyboard_type`, `mouse_click`, `mouse_move`
- **Best Use:** Automating desktop interactions, such as typing, clicking, moving the mouse, or capturing the screen. Useful for tasks requiring GUI interaction.

### `github.com/zcaceres/fetch-mcp`
- **Tools:** `fetch_html`, `fetch_markdown`, `fetch_txt`, `fetch_json`
- **Best Use:** Retrieving content from URLs in various formats (HTML, Markdown, plain text, JSON). Preferred over `execute_command curl/wget` for fetching web content.

### `github.com/modelcontextprotocol/servers/tree/main/src/filesystem`
- **Tools:** `read_file`, `read_multiple_files`, `write_file`, `edit_file`, `create_directory`, `list_directory`, `directory_tree`, `move_file`, `search_files`, `get_file_info`, `list_allowed_directories`
- **Best Use:** Performing file system operations within the configured allowed directories. Can be used as an alternative to built-in file tools, especially when specific path restrictions are managed by the server.

### `github.com/modelcontextprotocol/servers/tree/main/src/brave-search`
- **Tools:** `brave_web_search`, `brave_local_search`
- **Best Use:** Conducting web searches for general information, documentation, or recent events (`brave_web_search`) and searching for local businesses or places (`brave_local_search`). Primary tool for external research.

### `github.com/modelcontextprotocol/servers/tree/main/src/github`
- **Tools:** `create_or_update_file`, `search_repositories`, `create_repository`, `get_file_contents`, `push_files`, `create_issue`, `create_pull_request`, `fork_repository`, `create_branch`, `list_commits`, `list_issues`, `update_issue`, `add_issue_comment`, `search_code`, `search_issues`, `search_users`, `get_issue`, `get_pull_request`, `list_pull_requests`, `create_pull_request_review`, `merge_pull_request`, `get_pull_request_files`, `get_pull_request_status`, `update_pull_request_branch`, `get_pull_request_comments`, `get_pull_request_reviews`
- **Best Use:** Interacting with GitHub repositories and features remotely, such as managing files, issues, pull requests, and searching GitHub content.

### `python-executor`
- **Tools:** `run_python_code`
- **Best Use:** Executing Python code snippets or scripts, especially those with specific library dependencies. Preferred for self-contained Python tasks.

### `matlab-server`
- **Tools:** `execute_matlab_code`, `generate_matlab_code`
- **Best Use:** Running existing MATLAB code or generating new MATLAB code from natural language descriptions, particularly for tasks involving numerical computation or simulations.

### `github.com/modelcontextprotocol/servers/tree/main/src/git`
- **Tools:** `git_status`, `git_diff_unstaged`, `git_diff_staged`, `git_diff`, `git_commit`, `git_add`, `git_reset`, `git_log`, `git_create_branch`, `git_checkout`, `git_show`
- **Best Use:** Interacting with local Git repositories in a structured and safer manner compared to raw `execute_command git ...`. Useful for managing version control within the workspace.

### `github.com/modelcontextprotocol/servers/tree/main/src/puppeteer`
- **Tools:** `puppeteer_navigate`, `puppeteer_screenshot`, `puppeteer_click`, `puppeteer_fill`, `puppeteer_select`, `puppeteer_hover`, `puppeteer_evaluate`
- **Best Use:** Automating browser interactions, navigating web pages, filling forms, clicking elements, taking screenshots, and executing JavaScript in a browser environment. Useful for web scraping, testing, and UI automation.

### `sequential-thinking`
- **Tools:** `sequentialthinking`
- **Best Use:** Structuring complex problem-solving, planning multi-step solutions, analyzing ambiguous situations, and documenting the reasoning process internally.

### `@21st-dev/magic`
- **Tools:** `21st_magic_component_builder`, `logo_search`, `21st_magic_component_inspiration`, `21st_magic_component_refiner`
- **Best Use:** Searching for, generating, and refining UI components, particularly React components, and searching for company logos.

### `Zapier MCP`
- **Tools:** `gmail_find_email`, `web_parser_by_zapier_parse_webpage`, `google_sheets_copy_worksheet`, `canva_find_design`, `canva_export_design`, `google_docs_find_a_document`, `canva_upload_asset`, `webhooks_by_zapier_put`, `google_drive_create_file_from_text`, `canva_create_design`, `webhooks_by_zapier_custom_request`, `google_sheets_lookup_spreadsheet_`, `webhooks_by_zapier_get`, `google_sheets_format_spreadsheet_`, `google_slides_create_presentation_`, `webhooks_by_zapier_post`, `google_sheets_create_worksheet`, `code_by_zapier_run_python`, `google_drive_upload_file`, `google_docs_append_text_to_document`, `google_sheets_create_spreadsheet`, `google_sheets_create_spreadsheet_`, `google_drive_retrieve_files_from_`, `google_docs_create_document_from_`, `zapier_manager_find_app`, `google_sheets_create_multiple_`, `google_sheets_create_spreadsheet_`, `weather_by_zapier_get_current_`, `google_sheets_clear_spreadsheet_`, `edit_actions`, `add_actions`
- **Best Use:** Interacting with a wide range of external services and APIs through Zapier integrations, such as managing emails, spreadsheets, documents, and triggering webhooks.
