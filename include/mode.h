#ifndef MODE_H
#define MODE_H

typedef enum {
    NORMAL,
    INSERT,
} MODE;

char *modestr(MODE mode); 

#endif
