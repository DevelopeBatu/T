#include <ncurses.h>
#include "buffer.h"

#define ctrl(x) ((x) & 0x1f)
#define TAB_WIDTH 4

int main() {
    int row, col;
    Buffer buffer;

    // Init Screen
    initscr();
    raw();
    keypad(stdscr, TRUE);
    noecho();

    getmaxyx(stdscr, row, col);
    init_buffer(&buffer, row, col);

    int ch = 0;
    int y = 0, x = 0;

    while (ch != ctrl('q')) {
        display_buffer(&buffer);
        move(y, x);
        refresh();

        // Insert
        ch = getch();
        if (ch == KEY_BACKSPACE || ch == 127 || ch == 8) {
            if (x > 0) {
                x--;
                delete_char(&buffer, y, x);
            } else if (y > 0) {
                y--;
                x = buffer.col_count - 1;
                delete_char(&buffer, y, x);
            }
        } else if (ch == KEY_UP) {
            if (y > 0) y--;
        } else if (ch == KEY_DOWN) {
            if (y < row - 1) y++;
        } else if (ch == KEY_LEFT) {
            if (x > 0) {
                x--;
            } else if (y > 0) {
                y--;
                x = buffer.col_count - 1;
            }
        } else if (ch == KEY_RIGHT) {
            if (x < col - 1) {
                x++;
            } else if (y < row - 1) {
                y++;
                x = 0;
            }
        } else if (ch == '\t') {
            for (int i = 0; i < TAB_WIDTH; i++) {
                insert_char(&buffer, y, x, ' ');
                x++;
                if (x >= buffer.col_count) {
                    x = 0;
                    y++;
                }
            }
        } else if (ch == '\n') {
            split_line(&buffer, y, x);
            y++;
            x = 0;
        } else {
            insert_char(&buffer, y, x, ch);
            x++;
            if (x >= buffer.col_count) {
                x = 0;
                y++;
            }
        }
    }

    // Close Screen
    free_buffer(&buffer);
    endwin();
    return 0;
}
