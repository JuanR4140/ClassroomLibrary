let verify = async (users, data) => {
    let verified = false;
    
    if(!data.username){
      verified = false;
      return {
        verified: verified
      }
    }
    
    const userRef = await users.doc(data.username);
    const user = await userRef.get();
    if(!user.exists){
      verified = false;
      return {
        verified: verified
      }
    }
  
    const serverToken = user.data().token;
    if(data.token != serverToken){
      verified = false;
      return {
        verified: false
      }
    }
  
    verified = true;
    return {
      verified: verified,
      userRef: userRef,
      user: user.data()
    }
}

module.exports = {
  verify
}
