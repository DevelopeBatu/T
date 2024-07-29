#include "mode.h"

char *modestr(MODE mode){
    switch(mode){
        case NORMAL:
            return "NORMAL";
            break;
        
        case INSERT:
            return "INSERT";
            break;
        default:
            return "NORMAL";
            break;
    }
}