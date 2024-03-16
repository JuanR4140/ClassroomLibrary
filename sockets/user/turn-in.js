const BadWordsFilter = require("bad-words");
const badWordsFilter = new BadWordsFilter();

const LeoProfanity = require("leo-profanity");

const {
    RegExpMatcher,
    englishDataset,
    englishRecommendedTransformers
} = require("obscenity");

const ObscenityMatcher = new RegExpMatcher({
    ...englishDataset.build(),
    ...englishRecommendedTransformers
});

const { toTitleCase } = require("../../utils/toTitleCase.js");
const { logger } = require("../../system/logger.js");
const { verify } = require("../../utils/verify.js");

module.exports = (socket, users, books, email_queue) => {
    socket.on("turn-in", async (data) => {
        let { verified, userRef, user } = await verify(users, data);
        if(!verified) {socket.emit("fatal"); return; }

        let allowed_stars = ["N", "1", "2", "3", "4", "5"];
        if(!allowed_stars.includes(data.stars)){
            socket.emit("modify-results", {message: "Invalid data.", bgColor: "#FF5555", txColor: "#FFFFFF"});
            return;
        }

        if(data.stars != "N"){
            if(data.review.length < 25){
                socket.emit("modify-results", {message: "Review too short.", bgColor: "#FF5555", txColor: "#FFFFFF"});
                return;
            }

            let profanity_check_1 = badWordsFilter.isProfane(data.review);
            let profanity_check_2 = LeoProfanity.check(data.review);
            let profanity_check_3 = ObscenityMatcher.hasMatch(data.review);
    
            if(profanity_check_1 || profanity_check_2 || profanity_check_3){
                logger.log(`[INFO] ${data.username} tried submitting review "${data.review}", but profanity checks prevented it from being uploaded.`);
                socket.emit("modify-results", {message: "Unable to submit review.", bgColor: "#FF5555", txColor: "#FFFFFF"});
                return;
            }
        }


        const bookRef = await books.doc(data.isbn);
        const book = await bookRef.get();
        let user_books = ( user.books == undefined ? [] : user.books );

        if(book.exists && user_books.includes(book.data().isbn)){
            let element = user_books.indexOf(book.data().isbn);
            user_books.splice(element, 1);

            users.doc(data.username).update({
                books: user_books
            });
            books.doc(book.data().isbn).update({
                available: true,
                holder: "",
                return_date: "",
                checked_out: ""
            });

            let mail_db_ref = await email_queue.doc(`${book.data().isbn}-two-weeks`);
            let mail_db = await mail_db_ref.get();
            let mail_db_ref_2 = await email_queue.doc(`${book.data().isbn}-three-days`);
            let mail_db_2 = await mail_db_ref_2.get();

            // Check if two week notice mail exists for the book, if it does, delete it
            if(mail_db.exists){
                mail_db_ref.delete();
            }
            if(mail_db_2.exists){
                mail_db_ref_2.delete();
            }

            if(data.stars != "N"){
                let reviews = book.data().reviews;
                let d = {
                    rating: parseInt(data.stars),
                    review: data.review
                };
                reviews[data.username] = d;
                
                books.doc(book.data().isbn).update({
                    reviews: reviews
                });
            }

            logger.log(`[INFO] ${data.username} returned book ${toTitleCase(book.data().title)}.`);
            socket.emit("modify-results", {message: "Book turned in!", bgColor: "#55FF55", txColor: "#000000"});
        }else{
            socket.emit("modify-results", {message: "Could not turn in book.", bgColor: "#FF5555", txColor: "#FFFFFF"});
        }

    });
}