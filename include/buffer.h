#ifndef BUFFER_H
#define BUFFER_H

typedef struct {
    char** lines;
    int line_count;
    int col_count;
} Buffer;

void init_buffer(Buffer* buffer, int rows, int cols);
void free_buffer(Buffer* buffer);
void insert_char(Buffer* buffer, int y, int x, char ch);
void delete_char(Buffer* buffer, int y, int x);
void split_line(Buffer* buffer, int y, int x);
void display_buffer(Buffer* buffer);

#endif
