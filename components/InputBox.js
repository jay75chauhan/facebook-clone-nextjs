import React, { useRef, useState } from "react";
import Image from "next/image";
import { useSession } from "next-auth/client";
import { EmojiHappyIcon } from "@heroicons/react/outline";
import { CameraIcon, VideoCameraIcon } from "@heroicons/react/solid";
import { db, storage } from "../firebase";
import firebase from "firebase";
function InputBox() {
  const inputRef = useRef(null);
  const filepickeRef = useRef(null);
  const [session] = useSession(null);
  const [imageToPost, setImageToPost] = useState(null);

  const sendPost = (e) => {
    e.preventDefault();

    if (!inputRef.current.value) return;

    db.collection("posts")
      .add({
        message: inputRef.current.value,
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      })
      .then((doc) => {
        if (imageToPost) {
          const uploadTask = storage
            .ref(`posts/${doc.id}`)
            .putString(imageToPost, "data_url");

          removeImage();

          uploadTask.on(
            "state_change",
            null,
            (error) => console.log(error),
            () => {
              //when the upload completes
              storage
                .ref("posts")
                .child(doc.id)
                .getDownloadURL()
                .then((url) => {
                  db.collection("posts").doc(doc.id).set(
                    {
                      postImage: url,
                    },
                    { merge: true }
                  );
                });
            }
          );
        }
      });
    inputRef.current.value = "";
  };

  const addImageToPost = (e) => {
    const reader = new FileReader();
    if (e.target.files[0]) {
      reader.readAsDataURL(e.target.files[0]);
    }
    reader.onload = (readerEvent) => {
      setImageToPost(readerEvent.target.result);
    };
  };
  const removeImage = () => {
    setImageToPost(null);
  };

  return (
    <div className="bg-white rounded-2xl  shadow-md text-gray-500 font-medium mt-6">
      <div className="flex space-x-1 sm:space-x-4 p-4 items-center">
        <Image
          src={session.user.image}
          className="rounded-full"
          width={40}
          height={40}
        />
        <form className="flex flex-1  ">
          <input
            ref={inputRef}
            className="rounded-full sm:text-lg text-sm h-9 sm:h-12 bg-gray-100 shadow-md flex-grow px-2 py-1 sm:px-5 focus:outline-none"
            type="text"
            placeholder={`what's on your mind,${session.user.name}?`}
          />
          <button hidden type="submit" onClick={sendPost}></button>
        </form>
        {imageToPost && (
          <div
            className="flex flex-col filter hover:brightness-110 transition duration-150 transform hover:scale-105 cursor-pointer"
            onClick={removeImage}
          >
            <img className="h-10 object-contain" src={imageToPost} alt="" />
            <p className="text-xs text-red-500 text-center">Remove</p>
          </div>
        )}
      </div>

      <div className="flex justify-evenly p-3 border-t">
        <div className="inoutIcon">
          <VideoCameraIcon className="h-7 text-red-500 " />
          <p className="text-xs hidden sm:inline-flex sm:text-sm xl:text-base">
            Live Video
          </p>
        </div>
        <div onClick={() => filepickeRef.current.click()} className="inoutIcon">
          <CameraIcon className="h-7 text-green-500 " />
          <p className="text-xs hidden sm:inline-flex sm:text-sm xl:text-base">
            Photo/Video
          </p>
          <input
            type="file"
            hidden
            onChange={addImageToPost}
            ref={filepickeRef}
          />
        </div>
        <div className="inoutIcon">
          <EmojiHappyIcon className="h-7 text-yellow-500 " />
          <p className="text-xs hidden sm:inline-flex sm:text-sm xl:text-base">
            Feeling/Activity
          </p>
        </div>
      </div>
    </div>
  );
}

export default InputBox;
