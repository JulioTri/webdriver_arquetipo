import { Interaction } from '@serenity-js/core';
import { browser } from '@wdio/globals';
import { Key } from 'webdriverio';

export const interactionKeys = {

  enter: () =>
    Interaction.where(
      `#actor presses Enter`,
      async () => {
        await browser.keys([Key.Enter]);
        console.log("enter");
        
      }
    ),

  escape: () =>
    Interaction.where(
      `#actor presses Escape`,
      async () => {
        await browser.keys([Key.Escape]);
      }
    ),

  tab: () =>
    Interaction.where(
      `#actor presses Tab`,
      async () => {
        await browser.keys([Key.Tab]);
      }
    ),

  backspace: () =>
    Interaction.where(
      `#actor presses Backspace`,
      async () => {
        await browser.keys([Key.Backspace]);
      }
    ),

  arrowDown: () =>
    Interaction.where(
      `#actor presses ArrowDown`,
      async () => {
        await browser.keys([Key.ArrowDown]);
      }
    ),

  arrowUp: () =>
    Interaction.where(
      `#actor presses ArrowUp`,
      async () => {
        await browser.keys([Key.ArrowUp]);
      }
    ),

  ctrlA: () =>
    Interaction.where(
      `#actor presses Ctrl + A`,
      async () => {
        await browser.keys([Key.Control, 'a']);
        await browser.keys(Key.NULL);
      }
    ),

  ctrlC: () =>
    Interaction.where(
      `#actor presses Ctrl + C`,
      async () => {
        await browser.keys([Key.Control, 'c']);
        await browser.keys(Key.NULL);
      }
    ),

  ctrlV: () =>
    Interaction.where(
      `#actor presses Ctrl + V`,
      async () => {
        await browser.keys([Key.Control, 'v']);
        await browser.keys(Key.NULL);
      }
    ),

  shiftTab: () =>
    Interaction.where(
      `#actor presses Shift + Tab`,
      async () => {
        await browser.keys([Key.Shift, Key.Tab]);
        await browser.keys(Key.NULL);
      }
    ),

};