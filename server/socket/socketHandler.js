const Message = require('../models/Message');

module.exports = (io) => {
  const onlineUsers = new Map();

  io.on('connection', (socket) => {
    console.log(`[Socket] Connected: ${socket.id}`);

    socket.on('user_online', (userId) => {
      onlineUsers.set(userId, socket.id);
      io.emit('online_users', Array.from(onlineUsers.keys()));
      socket.broadcast.emit('new_user_joined', { userId });
    });

    socket.on('join_room', ({ userId, targetId }) => {
      const roomId = [userId, targetId].sort().join('_');
      socket.join(roomId);
      socket.emit('room_joined', { roomId });
    });

    socket.on('send_message', async ({ roomId, senderId, text, prefilledTemplate }) => {
      try {
        const message = await Message.create({
          roomId, sender: senderId, text, prefilledTemplate
        });
        const populated = await message.populate('sender', 'name role');
        io.to(roomId).emit('receive_message', populated);
      } catch (err) {
        socket.emit('message_error', { error: err.message });
      }
    });

    socket.on('join_copilot_room', ({ teamId }) => {
      socket.join(`copilot_${teamId}`);
    });

    socket.on('copilot_message', ({ teamId, message }) => {
      io.to(`copilot_${teamId}`).emit('copilot_update', { message });
    });

    socket.on('typing', ({ roomId, userId }) => {
      socket.to(roomId).emit('user_typing', { userId });
    });

    socket.on('stop_typing', ({ roomId, userId }) => {
      socket.to(roomId).emit('user_stop_typing', { userId });
    });

    socket.on('disconnect', () => {
      for (const [userId, sid] of onlineUsers.entries()) {
        if (sid === socket.id) {
          onlineUsers.delete(userId);
          io.emit('online_users', Array.from(onlineUsers.keys()));
          socket.broadcast.emit('user_offline', { userId });
          break;
        }
      }
      console.log(`[Socket] Disconnected: ${socket.id}`);
    });
  });
};
