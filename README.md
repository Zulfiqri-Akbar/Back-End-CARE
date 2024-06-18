# Back-End CARE (Children’s Autism Resource & Education)

## Introduction
This is the back-end code for a mobile application called CARE (Children's Autism Resource & Education). The main feature of this application is that it uses a machine learning model that can predict whether a child has autism or not and can also detect the emotions that are being felt by a child with autism.

## Requirements
1. Node.js v18+
2. @hapi/hapi
3. @hapi/joi
4. @hapi/boom
5. @hapi/jwt
6. hapi-auth-jwt2
7. sequelize
8. mysql2
9. bcrypt
10. jsonwebtoken
11. dotenv
12. @google-cloud/storage
13. @google-cloud/firestore
14. @tensorflow/tfjs
15. @tensorflow/tfjs-layers
16. @tensorflow/tfjs-node

## Preparation For Starting The Project
1. Create a backend-care directory and log into it using the command below:
 ```sh
mkdir backend-care
cd backend-care
```
2. Initialize the Node.js project using the command below:
```sh
npm init --y
```
3. Install the dependencies used in the project using the command below:
```sh
npm install @hapi/hapi @hapi/joi @hapi/boom @hapi/jwt sequelize mysql2 bcrypt jsonwebtoken hapi-auth-jwt2 dotenv @google-cloud/storage @google-cloud/firestore @tensorflow/tfjs @tensorflow/tfjs-layers @tensorflow/tfjs-node
```
4. Start the server using the command below:
```sh
npm run start
```

## Endpoints
### 1. `/signup` [POST]
#### Request Parameters
| Parameter | Data Type |
| --------- | ---------| 
| `username`     | Text     |
| `email`     | Text     |
| `password`     | Text     |
| `confirm_password`     | Text     |

### 2. `/login` [POST]
#### Request Parameters
| Parameter | Data Type |
| --------- | ---------| 
| `email`     | Text     |
| `password`     | Text     |

### 3. `/update_profile` [PUT]
#### Authorization: Bearer Token 
#### Request Parameters
| Parameter | Data Type |
| --------- | ---------| 
| `profile_picture`     | File (png, jpg, jpeg)     |
| `username`     | Text     |
| `email`     | Text     |
| `password`     | Text     |
| `confirm_password`     | Text     |

### 4. `/user/info` [GET]
#### Authorization: Bearer Token 

### 5. `/logout` [POST]
#### Authorization: Bearer Token 

### 6. `/reset_password` [PUT]
#### Request Parameters
| Parameter | Data Type |
| --------- | ---------| 
| `email`     | Text     |
| `new_password`     | Text     |
| `confirm_password`     | Text     |

### 7. `/predict_autism` [POST]
#### Authorization: Bearer Token 
#### Request Parameters
| Parameter | Data Type |
| --------- | ---------| 
| `image`     | File (png, jpg, jpeg)     |

### 8. `/predict_autism/histories` [GET]
#### Authorization: Bearer Token 

### 9. `/predict_emotion` [POST]
#### Authorization: Bearer Token 
#### Request Parameters
| Parameter | Data Type |
| --------- | ---------| 
| `image`     | File (png, jpg, jpeg)     |

### 10. `/predict_emotion/histories` [GET]
#### Authorization: Bearer Token 

