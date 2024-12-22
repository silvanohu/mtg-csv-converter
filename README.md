# mtg-csv-converter

# Table of Contents

- [Introduction](#introduction)
- [Features](#features)
  - [CardTrader to Moxfield](#cardtrader-to-moxfield)
- [Installation](#installation)
- [Usage](#usage)
- [Contributing](#contributing)

# Introduction

This is a simple Python application that converts the 
files used by various Magic: The Gathering collection 
trackers to other formats.

I made this driven by my personal needs, so the only feature 
available right now is the conversion from a CardTrader 
`.xls` to a Moxfield `.csv`.

# Features

## CardTrader to Moxfield
With the application you can convert a CardTrader `.xls` 
file (like the one you can download in your order details) 
to a Moxfield `.csv`.

This way, everytime you order some cards on CardTrader, you 
can easily import the list of your new cards into your 
Moxfield collection with a single import.

# Installation
The application is a simple Python script, so all you need 
to do is to download the repository in your preferred way.

The only dependency you need is the `pandas` library.

# Usage
To use the application run the `app.py` file and paste the 
path of the `.xls` file containing the cards' details, a 
`.csv` file will be created.

# Contributing
Feel free to contribute in any way!