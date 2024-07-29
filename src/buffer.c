#include <ncurses.h>
#include <stdlib.h>
#include <string.h>
#include "buffer.h"

void init_buffer(Buffer* buffer, int rows, int cols) {
    buffer->line_count = rows;
    buffer->col_count = cols;
    buffer->lines = malloc(sizeof(char*) * rows);
    for (int i = 0; i < rows; i++) {
        buffer->lines[i] = malloc(sizeof(char) * (cols + 1));
        memset(buffer->lines[i], ' ', cols);
        buffer->lines[i][cols] = '\0';
    }
}

void free_buffer(Buffer* buffer) {
    for (int i = 0; i < buffer->line_count; i++) {
        free(buffer->lines[i]);
    }
    free(buffer->lines);
}

void insert_char(Buffer* buffer, int y, int x, char ch) {
    if (y < buffer->line_count && x < buffer->col_count) {
        memmove(&buffer->lines[y][x + 1], &buffer->lines[y][x], buffer->col_count - x - 1);
        buffer->lines[y][x] = ch;
    }
}

void delete_char(Buffer* buffer, int y, int x) {
    if (y < buffer->line_count && x < buffer->col_count) {
        memmove(&buffer->lines[y][x], &buffer->lines[y][x + 1], buffer->col_count - x - 1);
        buffer->lines[y][buffer->col_count - 1] = ' ';
    }
}

void split_line(Buffer* buffer, int y, int x) {
    if (y < buffer->line_count - 1) {
        memmove(&buffer->lines[y + 1], &buffer->lines[y], sizeof(char*) * (buffer->line_count - y - 1));
        buffer->lines[y + 1] = malloc(sizeof(char) * (buffer->col_count + 1));
        strncpy(buffer->lines[y + 1], &buffer->lines[y][x], buffer->col_count - x);
        buffer->lines[y][x] = '\0';
    }
}

void display_buffer(Buffer* buffer) {
    for (int i = 0; i < buffer->line_count; i++) {
        mvprintw(i, 0, buffer->lines[i]);
    }
}
