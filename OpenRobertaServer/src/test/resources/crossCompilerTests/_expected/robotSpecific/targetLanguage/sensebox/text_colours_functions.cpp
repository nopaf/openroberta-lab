// This file is automatically generated by the Open Roberta Lab.
#define _ARDUINO_STL_NOT_NEEDED
#include "SenseBoxMCU.h"
#undef max
#undef min
#include <NEPODefs.h>
#include <stdlib.h>



void text();
void colour();
void parameters(double ___x, bool ___x2, String ___x3, unsigned int ___x4, std::list<double> ___x5, std::list<bool> ___x6, std::list<String> ___x7, std::list<unsigned int> ___x8);
double function_return_numberVar();
bool function_return_booleanVar();
String function_return_stringVar();
unsigned int function_return_colourVar();
std::list<double> function_return_numberList();
std::list<bool> function_return_booleanList();
std::list<String> function_return_stringList();
std::list<unsigned int> function_return_colourList();


double ___numVar;
bool ___boolVar;
String ___stringVar;
unsigned int ___colourVar;
std::list<double> ___numList;
std::list<bool> ___boolList;
std::list<String> ___stringList;
std::list<unsigned int> ___colourList;


void text() {
    // 
    ___stringVar += ___stringVar;
}

void colour() {
    Serial.println(RGB(___numVar, ___numVar, ___numVar));
}

void parameters(double ___x, bool ___x2, String ___x3, unsigned int ___x4, std::list<double> ___x5, std::list<bool> ___x6, std::list<String> ___x7, std::list<unsigned int> ___x8) {
}

double function_return_numberVar() {
    return ___numVar;
}

bool function_return_booleanVar() {
    return ___boolVar;
}

String function_return_stringVar() {
    return ___stringVar;
}

unsigned int function_return_colourVar() {
    return ___colourVar;
}

std::list<double> function_return_numberList() {
    return ___numList;
}

std::list<bool> function_return_booleanList() {
    return ___boolList;
}

std::list<String> function_return_stringList() {
    return ___stringList;
}

std::list<unsigned int> function_return_colourList() {
    return ___colourList;
}

void setup()
{
    Serial.begin(9600);
    
    ___numVar = 0;
    ___boolVar = true;
    ___stringVar = "";
    ___colourVar = RGB(0xFF, 0xFF, 0xFF);
    ___numList = {0, 0, 0};
    ___boolList = {true, true, true};
    ___stringList = {"", "", ""};
    ___colourList = {RGB(0xFF, 0xFF, 0xFF), RGB(0xFF, 0xFF, 0xFF), RGB(0xFF, 0xFF, 0xFF)};
}

void loop()
{
    text();
    colour();
    parameters(___numVar, ___boolVar, ___stringVar, ___colourVar, ___numList, ___boolList, ___stringList, ___colourList);
    Serial.println(function_return_numberVar());
    Serial.println(function_return_booleanVar());
    Serial.println(function_return_stringVar());
    Serial.println(function_return_colourVar());
    ___numList = function_return_numberList();
    ___boolList = function_return_booleanList();
    ___stringList = function_return_stringList();
    ___colourList = function_return_colourList();
}