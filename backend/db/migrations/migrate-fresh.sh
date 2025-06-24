#!/bin/bash

# Reset database to version 0 (down all migrations)
goose down-to 0

# Apply all migrations (up)
goose up