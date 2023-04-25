// Your web app's Firebase configuration
var firebaseConfig = {
	// apiKey: "AIzaSyAOAO_LHe0l6L3SyKeYPy3AAYD3sC6NSKM",
	// authDomain: "test-firebase-auth-e737c.firebaseapp.com",
	// databaseURL: "https://test-firebase-auth-e737c.firebaseio.com",
	// projectId: "test-firebase-auth-e737c",
	// storageBucket: "",
	// messagingSenderId: "985855990950",
	// appId: "1:985855990950:web:fba9c4c6f1e6b842142867",
	// measurementId: "G-KT83KDHQCL"
	apiKey: "AIzaSyA6M9A2zlxhNXNCjsZiishZN4vX1od3rnQ",
  authDomain: "craving-solutions.firebaseapp.com",
  projectId: "craving-solutions",
  storageBucket: "craving-solutions.appspot.com",
  messagingSenderId: "507444083794",
  appId: "1:507444083794:web:54c5d09bb5d03c791d338b"
};

firebase.initializeApp(firebaseConfig);

// make auth and firestore references
const auth = firebase.auth()
const db = firebase.firestore()
if(firebase.storage) {
  const storage = firebase.storage();
}


auth.onAuthStateChanged(user => {
  console.log("USER", user);
  if (user) {
    $("#addrestaurant-menu-item").show()
    $("#findrestaurant-menu-item").show()
    $("#signout-menu-item").show()
    $("#login-menu-item").hide()
  } else {
    $("#signout-menu-item").hide()
    $("#addrestaurant-menu-item").hide()
    $("#findrestaurant-menu-item").hide()
    $("#login-menu-item").show()
  }
  //  window.location.href = "index.html"
});

$( "#login-form" ).submit(function( event ) {
  event.preventDefault();
  var email = $("#login_email").val()
  var password = $("#login_password").val()
  if(!email || !password) {
  	return alert("Please fill required fields.")
  }

  auth.signInWithEmailAndPassword(email, password)
  .then(cred => {
     window.location.href = "index.html" 
  })
  .catch((error) => {
  	alert(error.message)
  });
});

$( "#signup-from" ).submit(function( event ) {
  event.preventDefault();
  var name = $("#signup-name").val()
  var email = $("#signup-email").val()
  var password = $("#signup-password").val()
  var confirmPassword = $("#signup-password-confirm").val()
  var termsChecked = $("#signup-terms").is(":checked")
  if(!email || !password || !name || !confirmPassword || !termsChecked) {
    return alert("Please fill required fields.")
  }

  if(password !== confirmPassword) {
    return alert("Password should be same as confirm password")
  }

  auth
    .createUserWithEmailAndPassword(email, password)
    .then(cred => {
      console.log(cred.user);
      return db.collection("users")
          .add({
            name,
            uuid: cred.user.uid
          })

      })
    .then((data) => {
      window.location.href = "index.html" 
    })
    .catch((error) => {
      console.log("Error", error)
      alert(error.message)
    });
});

$( "#signout-menu-item" ).click(function( event ) {
  event.preventDefault();
  auth.signOut();
});

$("#contact-us").submit(async function(event) {
  console.log("jsbcasjbcasjjh")
  event.preventDefault();
  let name = $("#contact-name").val()
  let email = $("#contact-email").val()
  let subject = $("#contact-subject").val()
  let message = $("#contact-message").val()
  if(!name || !email || !subject || !message) {
    return alert("Please fill required fields.")
  }
  let fileURL = await uploadFile();

  db.collection("contactus")
    .add({
      name,email, subject, message, page: window.location.href, doc: fileURL
    })
    .then(() => {
      this.reset();
      alert("Your message has been sent. Thank you!")
    })
    .catch(err => alert(err.message));
})

function loadContactUsDetails() {
  db.collection("contactus")
    .get()
    .then(async (snapshot ) => {
      let html = ""
      if(snapshot ) {
        snapshot.forEach((doc, index) => {
          var data = doc.data()
          console.log(doc.id, '=>', data);
          html += `
            <tr>
            <th scope="row">${data.name}</th>
            <td>${data.email}</td>
            <td>${data.subject}</td>
            <td>${data.message}</td>
            <td>${data.doc ? "<a href=" + data.doc + " target='new'>View</a>":""}</td>
          </tr>
          `
        });
      }
      console.log("html", html)
      if(html) {
        $("#contact-us-data tbody").append(html)
      } else {
        $("#contact-us-data tbody").append(`<tr>
          <td class="text-center" colspan="5">No Data Found !</td>
        </tr>`)
        
      }
    })
    .catch(err => console.log("[Error fetching data]", (err.message)));
}

async function uploadFile() {
  return new Promise(function(resolve, reject) {
     var file=document.getElementById("files").files[0];
     if(file) {
        var storageref = storage.ref();
        var thisref = storageref.child("docs").child(Date.now().toString()).put(file);

        thisref.on('state_changed',function(snapshot) {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log('Upload is ' + progress + '% done');
        }, function(error) {
          resolve("")
        }, function() {
          // Uploaded completed successfully, now we can get the download URL
          return thisref.snapshot.ref
          .getDownloadURL()
          .then(function(downloadURL) {
            resolve(downloadURL)
          })
          .catch(err => {
            resolve("")
            console.log("[Error uploading data]", (err.message))
          });
        });
     } else {
      resolve("")
     }
  })
   
}