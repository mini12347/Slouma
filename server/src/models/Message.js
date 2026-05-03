import mongoose from "mongoose";
const MessageSchema = mongoose.Schema({
    senderID: {
        type: String,
        required: [true, 'enter a sender ID']
    },
    receiverID: {
        type: String,
        required: [true, 'enter a receiver ID']
    },
    message: {
        type: String,
        required: [true, 'enter a message']
    },
    date: {
        type: Date,
        required: [true, 'enter a date']
    },
    time: {
        type: String,
        required: [true, 'enter a time']
    },

});
const Message = mongoose.model('Message', MessageSchema);
export default Message;