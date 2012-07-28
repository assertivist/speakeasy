#include <stdio.h>
#include <assert.h>
#include <stdlib.h>
#include <string.h>
#include "cgic.h"
#include "cJSON.h"
#include </opt/local/include/mysql5/mysql/mysql.h>
#include <time.h>

#define MYSQL_SERVER 	"localhost"
#define MYSQL_USER 		"root"
#define MYSQL_PASS 		"root"
#define MYSQL_CONNECTION_PORT		0
#define MYSQL_SOCK		"/Applications/MAMP/tmp/mysql/mysql.sock"
#define SECRET_SALT		"falsdjwoef0303f0w00v00sak00kkv0ckc0c00s_TACKS_IN_UR_SACK_____OUCH!!!!!"


cJSON *root, *fmt;

MYSQL *conn;

char client_id[1024];
char client_action[1024];
char client_ip[2024];
char client_useragent[80024];
char client_room[1024];
char client_last_key[1024];

void initSql();
void mysqlError();
void listRooms();
void addRoom(char *name, int type);
void loadClient();
int authUser(char *user, char *pass);
int endResponse();
char *makeGarbage(int length);

int cgiMain() {
	srand(time(NULL));
	cgiHeaderContentType("text/json");
	fprintf(cgiOut, "\r\n");
	root = cJSON_CreateObject();
	initSql();
	
	loadClient();
	
	if(client_room == NULL) return endResponse();

	cgiFormResultType actionresult = cgiFormStringNoNewlines("action", client_action, 1024);
	if(actionresult == cgiFormNotFound) {
		//no action supplied
		//heartbeat, look for updated events if room sent
	}
	else {
		if(strcmp(client_action, "chat") == 0) {
			//store the chat for other clients
			//send it back to this client
		}
		else if(strcmp(client_action, "something_else") == 0) {
			//yeah
		}
		else {
			//unsupported action
		}
	}
	return endResponse();
}
int endResponse(){
	fprintf(cgiOut, "%s", cJSON_Print(root));
	fprintf(cgiOut, "\r\n\r\n");
	mysql_close(conn);
	return 0;	
}

void loadClient() {
	cgiFormResultType idresult = cgiFormStringNoNewlines("clientid", client_id, 1024);
	strcat(client_ip, cgiRemoteAddr);
	strcat(client_useragent, cgiUserAgent);
	if(idresult == cgiFormNotFound) {
		char query[8024];
		sprintf(query, "insert into client (ip,useragent) values ('%s','%s')", cgiRemoteAddr, cgiUserAgent);
		
		mysql_query(conn, query);	
		cJSON_AddTrueToObject(root, "needname");
		char recid[50];
		sprintf(recid, "%u", mysql_insert_id(conn));
		cJSON_AddStringToObject(root, "your_new_id", recid);
	}
	else { //we have an id
		char query[25];
		sprintf(query, "select id,name,ip,useragent from clients where id = %s", client_id);
		mysql_query(conn, query);
		MYSQL_RES *result;
		result = mysql_store_result(conn);
		//int num_fields = mysql_num_fields(result);
		MYSQL_ROW clientrow = mysql_fetch_row(result);
		
		if(strcmp(clientrow[2], client_ip) == 0 || strcmp(clientrow[3], client_useragent) == 0) {
			//ip/user agent changed, invalidate session
			cJSON_AddFalseToObject(root, "your_new_id");
			return;
		}
		else {
			//client fingerprint valid
			if(strcmp(clientrow[1], "") == 0) {
				//no name
			}
			else{
			
			}
		}
	}
}

int userExists(char *user) {
	//returns 0 for user exists
	//returns 1 for new user
	char query[200];
	sprintf(query, "select id,name from users where name = %s", user);
	mysql_query(conn, query);
	MYSQL_RES *result;
	result = mysql_store_result(conn);
	MYSQL_ROW userrow = mysql_fetch_row(result);
	if(result == NULL) {
		mysqlError();
		return -1;
	}
	if((long)mysql_affected_rows(conn) < 1) return 1;
	else return 0;
}

int authUser(char *user, char *pass) {
	//returns 0 for correct user/pass
	//returns 1 for incorrect password
	char query[200];
	sprintf(query, "select id,name,hash from users where name = %s and hash = sha1(%s%s)", user, pass, SECRET_SALT);
	mysql_query(conn, query);
	MYSQL_RES *result;
	result = mysql_store_result(conn);
	MYSQL_ROW userrow = mysql_fetch_row(result);
	if(result == NULL) {
		mysqlError();
		return -1;
	}
	if((long)mysql_affected_rows(conn) < 1) return 1;
	else return 0;	
}

void addUser(char *user, char *pass) {
	char query[200];
	sprintf(query, "insert into users (name,hash) values ('%s',sha1('%s%s')", user, pass, SECRET_SALT);
	mysql_query(conn, query);
	return;
}


void initSql() {
	conn = mysql_init(NULL);
	if(conn == NULL) mysqlError();
	if(mysql_real_connect(conn, MYSQL_SERVER, MYSQL_USER, MYSQL_PASS, NULL, MYSQL_CONNECTION_PORT, MYSQL_SOCK, 0) == NULL) mysqlError();
	if(mysql_select_db(conn, "mafia")) mysqlError();
}

void mysqlError() {
	//fprintf(cgiOut, "Mysql error: %i %s", mysql_errno(conn), mysql_error(conn));
	cJSON_AddStringToObject(root, "sql_error", mysql_error(conn));
	//exit(2);
}

void listRooms() {
	cJSON *roomsObj;
	char query[50];
	sprintf(query, "select id,name,type,num_clients from rooms");
	mysql_query(conn, query);
	MYSQL_RES *result;
	result = mysql_store_result(conn);
	if(result == NULL) {
		mysqlError();
		return;
	}
	MYSQL_ROW *roomrow;
	if((long)mysql_affected_rows(conn) < 1) {
		cJSON_AddFalseToObject(root, "rooms");
	}
	else {
		roomsObj = cJSON_CreateArray();
		while ((roomrow = mysql_fetch_row(result))) {
			cJSON *roomObj;
			roomObj = cJSON_CreateObject();
			cJSON_AddStringToObject(roomObj, "id", roomrow[0]);
			cJSON_AddStringToObject(roomObj, "name", roomrow[1]);
			cJSON_AddNumberToObject(roomObj, "type", (int)roomrow[2]);
			cJSON_AddNumberToObject(roomObj, "num_clients", (int)roomrow[3]);
			cJSON_AddItemToArray(roomsObj, roomObj);
			cJSON_Delete(roomObj);
		}
		cJSON_AddItemToObject(root, "rooms", roomsObj);
	}
	mysql_free_result(result);
}

void addRoom(char *name, int type) {
	char query[50];
	sprintf(query, "insert into rooms (name, type, num_clients) values (%s, %d, %d)", name, type, 0);
	mysql_query(conn, query);
	listRooms();
}

char *makeGarbage(int length) {
	int i;
	int randNum;
	char *garbage;
	for(i = 0; i < length+1; i++){
		randNum = 52 * (rand() / (RAND_MAX + 1.0));
		strcat(garbage, (char)(randNum + 97));
	}
	return garbage;
}
/*
struct client *getClient(int id) {
	char query[25];
	sprintf(query, "select id,name,ip,useragent from clients where id = %d", id);
	mysql_query(conn, query);
	MYSQL_RES *result;
	result = mysql_store_result(conn);
	//int num_fields = mysql_num_fields(result);
	MYSQL_ROW clientrow = mysql_fetch_row(result);
	return client_create((int)clientrow[0],clientrow[1],clientrow[3],clientrow[4]);
}
*/
