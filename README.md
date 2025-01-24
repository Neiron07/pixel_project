# Test Project

## Version 3

The server was originally written in TypeScript, which worked well in development environments with some setup. However, the decision was made to migrate the server to Go to simplify the setup process and make the package more easily distributable. Please check the other development branches for updates.
---

### Version 0.1

<a id="setup"></a>

## Setup Requirements :rocket:

- A computer :smiley:
- <a href="https://nodejs.org/en/">node.js</a>
- Yarn (please use yarn), it can be downloaded via npm

    ```bash
    npm install -g yarn
    ```

---

<a id="access"></a>

## How to access the website/Setup Procedure :key:

<b>Version 2 (Vue.js implementation)</b>
<br />
To set it up for development, follow these steps, or check the releases for a better bundled package.

1. There are 2 main folders: `server` and `client`. The Vue.js code is inside `client`, and the Express backend code is inside `server`.

2. Open up 2 terminals/cmd in the root folder.

    ```bash
    TERMINAL 1
    cd client
    yarn install
    yarn start

    TERMINAL 2
    cd client
    yarn install
    yarn serve
    ```

3. The website will be available on http://localhost:5173 API: http://localhost:5000/.

4. To start the server, run the following 2 commands:

    ```bash
    yarn install
    yarn start
    ```

---

<a id="plans"></a>

## Future Plans and Timeline :bulb:

- [x] Pilot project with vanilla HTML, CSS, and JS
- [x] Implement with Vue.js
- [x] Fix some UI issues - aligning, etc.
- [x] Create Folders
- [x] Download Files
- [x] Upload Files
- [x] View File Size
- [x] Colored logging of events (for server console)
- [x] Implement security features - Restricted access to other files on the system by blocking requests outside the home directory (this has been done for navigation, file downloads, and deletions)

## Development Oriented Plans :bulb:

- Clean unnecessary code
- Make API RESTful
- Make various synchronous processes asynchronous
- Reduce dependencies

---

