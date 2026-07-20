import mongoose from "mongoose";
const NotificationSchema = mongoose.Schema({
    id: {
        type: String,
        required: [true, 'enter an ID']
    },
    receiverID: {
        type: String,
        required: [true, 'enter a receiver ID']
    },
    content: {
        type: String,
        required: [true, 'enter a message']
    },
    date: {
        type: Date,
        required: [true, 'enter a date']
    },
    read: {
        type: Boolean,
        default: false,
    },
    type: {
        type: String,
        required: [true, 'enter a type']
    },

});
const Notification = mongoose.model('Notification', NotificationSchema);
export default Notification;