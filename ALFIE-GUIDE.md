# Alfie's Guide

Everything you need to work on the D&D club website by yourself: set up a new computer
account, change things, and put your changes on the internet.

Live site: https://alfie-sixclaws.github.io/Dungeons-and-Dragons-Club/
Code: https://github.com/alfie-sixclaws/Dungeons-and-Dragons-Club

Lines that start with `$` are commands for the **Terminal**. Type everything after the `$`
(not the `$` itself) and press Enter. In VS Code you can open one with **Terminal → New Terminal**.

---

## Part 1: One-time setup (new computer account)

You only do this once per computer account.

### 1. Check git works

```
$ git --version
```

If a box pops up asking to install "command line developer tools", click **Install** and wait.
When it finishes, run the command again. You should see a version number.

### 2. Tell git who you are

```
$ git config --global user.name "alfie-sixclaws"
$ git config --global user.email "356480197+alfie-sixclaws@users.noreply.github.com"
```

(That email is GitHub's private address for you, so your real email isn't shown publicly.)

### 3. Make an SSH key

A key is a pair of files. The **private** one is a secret that stays on this computer.
The **public** one is safe to give to GitHub. GitHub uses it to check that it's really you.

```
$ ssh-keygen -t ed25519 -C "alfie-sixclaws"
```

- When it asks **"Enter file in which to save the key"**, just press Enter.
- When it asks for a **passphrase**, press Enter twice for none, or type one you'll remember.

Copy the public key so you can paste it:

```
$ pbcopy < ~/.ssh/id_ed25519.pub
```

(`pbcopy` puts it on the clipboard, so you don't have to select anything by hand.)

**Never share the file without `.pub`**: `~/.ssh/id_ed25519`. That's the secret one.

### 4. Give GitHub the public key

1. Go to github.com (signed in as alfie-sixclaws) → click your picture (top right) → **Settings**.
2. Left menu → **SSH and GPG keys** → **New SSH key**.
3. **Title:** something that says which computer, like `My own Mac account`.
4. **Key:** press **Cmd+V** to paste. It should be one long line that starts with `ssh-ed25519`
   and ends with `alfie-sixclaws`.
5. Click **Add SSH key**.

Test it:

```
$ ssh -T git@github.com
```

The first time it asks `Are you sure you want to continue connecting?`. Type `yes` and press Enter.
You want to see: **Hi alfie-sixclaws! You've successfully authenticated, but GitHub does not
provide shell access.** That's a success message, even though it sounds odd.

### 5. Download the project (clone)

```
$ mkdir -p ~/Developer
$ cd ~/Developer
$ git clone git@github.com:alfie-sixclaws/Dungeons-and-Dragons-Club.git
$ cd Dungeons-and-Dragons-Club
```

You now have a folder with the whole website. Open it in VS Code:

```
$ code .
```

(If that says `command not found`, open VS Code and use **File → Open Folder**, then pick
`Developer` → `Dungeons-and-Dragons-Club`.)

**Don't run `git init` here.** The clone is already a git project. (Running it again makes a
confusing repo inside a repo.)

---

## Part 2: Every time you work

### Start: get the latest version

```
$ cd ~/Developer/Dungeons-and-Dragons-Club
$ git pull
```

`git pull` downloads any changes made elsewhere (by you on another computer, or by someone else).

### See your changes on your own screen before publishing

Some features (like Export PDF) need a tiny local web server:

```
$ python3 -m http.server 8000
```

Then open http://localhost:8000 in a browser. Edit a file, save it, refresh the page.
Press **Ctrl+C** in the terminal to stop the server.

### Save and publish your changes

```
$ git status
$ git add .
$ git commit -m "Say what you changed"
$ git push
```

| Command | What it does |
|---|---|
| `git status` | Lists the files you changed. Look before you save. |
| `git add .` | Puts all your changes in the "to be saved" pile. |
| `git commit -m "..."` | Saves a snapshot, with a message describing it. |
| `git push` | Uploads your snapshots to GitHub. |

About one or two minutes after a push, the live site updates. If you don't see your change,
hard-refresh the page (**Cmd+Shift+R**), because browsers like to keep old copies.

Good commit messages say what and why: `Make the tiles blue`, `Change the title to Dragon Den`.

### Handy extras

```
$ git diff                    # shows exactly which lines you changed (press q to leave)
$ git log --oneline           # list of past snapshots (press q to leave)
$ git restore index.html      # undo ALL unsaved changes to one file (can't be undone!)
```

---

## Part 3: When something goes wrong

| What you see | What to do |
|---|---|
| `Permission denied (publickey)` | GitHub doesn't know this computer's key. Redo Part 1, steps 3 and 4. |
| `git push` says `rejected ... fetch first` | Someone changed GitHub since your last pull. Run `git pull`, then `git push` again. |
| `git pull` talks about **CONFLICT** | You and someone else changed the same lines. Stop and ask for help. Don't guess. |
| The page looks broken after you edit CSS | You probably deleted a `}` or `;`. Run `git diff` to see what you changed, or `git restore css/style.css` to undo. |
| The live site didn't change | Wait two minutes, then Cmd+Shift+R. Check **Actions** on the GitHub repo for a red cross. |
| `fatal: not a git repository` | You're in the wrong folder. `cd ~/Developer/Dungeons-and-Dragons-Club` |

Golden rule: **commit often**. Every commit is a save point you can go back to, so
experiments are safe.

---

## Part 4: Cheatsheet for changing how the site looks

### Where things live

| File | What's in it |
|---|---|
| `css/style.css` | Looks of the homescreen, tiles, breadcrumbs, character list. **Start here.** |
| `css/sheet.css` | Looks of the character sheet editor page. |
| `js/sheets/registry.js` | The colours of the two sheet types (blue and orange). |
| `index.html` | The homescreen's words and tiles. |

### The colour switchboard (top of `css/style.css`)

```css
:root {
  --bg: #000000;      /* page background */
  --panel: #ee1e0b;   /* tiles, buttons, cards, the side tab */
  --accent: #c9a227;  /* borders, headings, links (gold) */
  --text: #5de837;    /* normal writing */
  --muted: #8d869c;   /* small, quiet writing */
}
```

Change one value and it changes **everywhere** that name is used. That's what the `var(--name)` in
the rest of the file means: "use that colour from the switchboard".

| Name | Changes |
|---|---|
| `--bg` | Background of every page, and the inside of the hexagon breadcrumbs |
| `--panel` | Background of the tiles, Homebrew button, side tab and character cards |
| `--accent` | Title, tile borders, hexagon outline, links, the "+" and section headings |
| `--text` | Most words, including on tiles and buttons |
| `--muted` | Small grey text, faded "coming soon" tiles, the breadcrumb path |

### Ways to write a colour

| Style | Example | Notes |
|---|---|---|
| Name | `crimson`, `gold`, `tomato`, `teal`, `rebeccapurple` | Easy! About 140 names exist: search "CSS colour names". |
| Hex | `#4aa8e0` | `#RRGGBB`: amounts of red, green, blue (00 to ff). `#000000` black, `#ffffff` white. |
| RGB | `rgb(74, 168, 224)` | Same thing, in plain numbers 0 to 255. |
| See-through | `rgb(0 0 0 / 50%)` | The last number is how solid it is. |

**Tip:** In VS Code, a little coloured square appears next to a colour. Click it to get a
**colour picker** and slide to the colour you like.

### Colours that aren't on the switchboard yet

| File and line | What | Change it to... |
|---|---|---|
| `css/style.css` `.tile:hover` | Tile colour when the mouse is over it (`#3a3158`) | any colour |
| `css/style.css` `.character-card button:hover` | The red when hovering Delete (`#e63946`) | any colour |
| `js/sheets/registry.js` `color:` | `edu` = blue `#4aa8e0`, `nonedu` = orange `#e8823a` | any colour. Changes the picker and the character list. |

**Challenge:** the hover colour is hard-wired. Add `--hover: #3a3158;` to the switchboard and change
`.tile:hover { background: #3a3158; }` to `.tile:hover { background: var(--hover); }`.

To hunt for every colour in a file, use VS Code's search (**Cmd+F**) and look for `#`.

### Other fun things to change

| Property | Where | Try |
|---|---|---|
| `font-family` | `body` | `"Courier New", monospace` or `Impact, sans-serif` or `"Comic Sans MS", cursive` |
| `font-size` | `.tile` (1.3rem) | `2rem` for big, `1rem` for small. (`rem` = a multiple of the normal text size) |
| `border-radius` | `.tile` (12px) | `0` = sharp corners, `50px` = very round. `.side-tab` curves only the left. |
| `border` | `.tile` (`2px solid`) | `6px dashed`, `4px dotted`, `3px double` |
| `min-height` | `.tile` (150px) | Taller or shorter tiles |
| `grid-template-columns` | `.tiles` (`repeat(2, 1fr)`) | `repeat(3, 1fr)` gives 3 tiles per row |
| `gap` | `.tiles` (1rem) | Space between tiles |
| `opacity` | `.disabled` (0.5) | How faded "coming soon" tiles look. 0 is invisible, 1 is solid. |
| `--point` | `.breadcrumbs` (22px) | How pointy the hexagon is. Try `5px` or `40px`. |
| `max-width` | `main` (800px) | How wide the page can get |
| `box-shadow` | add to `.tile` | `box-shadow: 0 0 15px var(--accent);` makes a glow |
| `transform` | add to `.tile:hover` | `transform: scale(1.05);` makes the tile grow when you hover |

### The change, save, look loop

1. Change **one** thing.
2. Save (**Cmd+S**).
3. Refresh the page (Cmd+R) and look.
4. Happy? Commit it. Not happy? Press **Cmd+Z**, or `git restore css/style.css`.

Changing one thing at a time means you always know which change caused a problem.

### If you break something

You can't break it for good. Every commit is saved. To go back to how a file looked at the last
commit: `git restore css/style.css`. To see old versions, look at the **History** of the file on GitHub.
