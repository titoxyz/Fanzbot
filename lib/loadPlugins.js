/**
 * Copyright (c) 2025 PurrBits
 *
 * This script is released under the ISC License.
 * See https://opensource.org/licenses/ISC for details.
 *
 * Permission to use, copy, modify, and/or distribute this software for any
 * purpose with or without fee is hereby granted, provided that the above
 * copyright notice and this permission notice appear in all copies.
 *
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
 * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
 * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
 * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION
 * OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN
 * CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 *
 * This project is PUBLIC and part of the Bot Project:
 * https://github.com/purrbits
 */

import { readdirSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import chokidar from 'chokidar';

import color from './color.js';

async function importModule(modulePath) {
  const moduleURL = pathToFileURL(modulePath).href + `?id=${Date.now()}`;
  try {
    const esm = await import(moduleURL);
    return esm?.default ?? esm;
  } catch (error) {
    console.log(color.red(`[!] Error importing module ${modulePath}:`), error.message);
    throw error;
  }
}

export default class PluginsLoad {
  constructor(directory) {
    if (!directory)
      throw new Error('You must add plugins path before using this code!');
    this.directory = resolve(directory);
    this.plugins = {};
    this.watcher = null;
  }

  async scan(dir = this.directory) {
    try {
      const items = readdirSync(dir, { withFileTypes: true });

      const sortedItems = items.sort((a, b) => {
        return a.name > b.name ? 1 : -1;
      });

      for (const item of sortedItems) {
        const p = join(dir, item.name);
        if (item.isDirectory()) {
          await this.scan(p);
        } else if (item.isFile() && p.endsWith('.js')) {
          await this.add(p);
        }
      }
    } catch (error) {
      console.log(color.red(`[!] Error scanning directory ${dir}:`), error.message);
    }
  }

  async add(p) {
    try {
      if (p in this.plugins) delete this.plugins[p];
      const data = await importModule(p);
      this.plugins[p] = data;
      return data;
    } catch (error) {
      delete this.plugins[p];
      console.log(color.red(`[!] Failed To Load Plugin ${p}:`), error);
      return null;
    }
  }

  async load() {
    await this.scan();
    console.log(color.green(`[i] Successfuly Load ${Object.keys(this.plugins).length} plugins`));

    if (this.watcher) await this.watcher.close();

    this.watcher = chokidar.watch(this.directory, {
      ignored: /(^|[\/\\])\../,
      persistent: true,
      ignoreInitial: true,
      awaitWriteFinish: {
        stabilityThreshold: 300,
        pollInterval: 100,
      },
    });

    this.watcher.on('add', async (path) => {
      if (path.endsWith('.js')) {
        await this.add(path);
        console.log(color.cyan(`[+] Detected new plugin: ${path}`));
      }
    });

    this.watcher.on('change', async (path) => {
      if (path.endsWith('.js')) {
        await this.add(path);
        console.log(color.cyan(`[+] Updated plugin: ${path}`));
      }
    });

    this.watcher.on('unlink', (path) => {
      if (path in this.plugins) {
        delete this.plugins[path];
        console.log(color.cyan(`[-] Removed plugin: ${path}`));
      }
    });

    this.watcher.on('error', (error) => {
      console.log(color.red('[!] Watcher error:'), error);
    });
  }
}