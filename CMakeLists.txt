cmake_minimum_required(VERSION 3.10)

project(T)

set(CMAKE_C_STANDARD 99)

file(GLOB SOURCES "src/*.c")

add_executable(T ${SOURCES})

find_package(Curses REQUIRED)
target_include_directories(T PUBLIC
    ${CURSES_INCLUDE_DIR}
    include
)
target_link_libraries(T ${CURSES_LIBRARIES})
