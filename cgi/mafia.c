#include <stdio.h>
#include <assert.h>
#include <stdlib.h>
#include <string.h>
#include "cgic.h"
#include </opt/local/include/mysql5/mysql/mysql.h>

#define MYSQL_SERVER 	"localhost"
#define MYSQL_USER 		"root"
#define MYSQL_PASS 		"root"
#define MYSQL_PORT		0
#define MYSQL_SOCK		"/Applications/MAMP/tmp/mysql/mysql.sock"

char *jsonString;

MYSQL *conn;
void initSql();
void mysqlError();

struct client {
	int id;
	char *name;
	char *ip;
	char *useragent;
};

struct client *client_create(int id, char *name, char *ip, char *useragent) {
	struct client *c = malloc(sizeof(struct client));
	assert(c != NULL);
	
	c->id = id;
	c->name = strdup(name);
	c->ip = strdup(ip);
	c->useragent = strdup(useragent);
	return c;
}

void client_destroy(struct client *c){
	assert(c != NULL);
	
	free(c->name);
	free(c->ip);
	free(c->useragent);
	free(c);
}



int cgiMain() {
	cgiHeaderContentType("text/html");
	initSql();
	strcat(jsonString, "{");
	
	char id[1024];
	cgiFormResultType idresult = cgiFormStringNoNewlines("clientid", id, 1024);
	if(idresult == cgiFormNotFound) {
		strcat(jsonString, "\"needname\": true
		fprintf(cgiOut, "You did not give an id.");
	
	
	
	
	
	strcat(jsonString, "}");
	fprintf(cgiOut, jsonString);
	mysql_close(conn);
	return 0;
}

void initSql() {
	conn = mysql_init(NULL);
	if(conn == NULL) mysqlError();
	if(mysql_real_connect(conn, MYSQL_SERVER, MYSQL_USER, MYSQL_PASS, NULL, MYSQL_PORT, MYSQL_SOCK, 0) == NULL) mysqlError();
	if(mysql_select_db(conn, "mafia")) mysqlError();
}

void mysqlError(){
	fprintf(cgiOut, "Mysql error: %i %s", mysql_errno(conn), mysql_error(conn));
	//exit(2);
}

void listRooms(){
	

}

struct client *getClient(int id) {
	char query[25];
	sprintf(query, "select id,name,ip,useragent from clients where id = %d", id);
	mysql_query(conn, query);
	MYSQL_RES *result;
	result = mysql_store_result(conn);
	//int num_fields = mysql_num_fields(result);
	MYSQL_ROW clientrow = mysql_fetch_row(result);
	return client_create(clientrow[0],clientrow[1],clientrow[3],clientrow[4]);
}

