import clsx from "clsx";
import css from "./FriendListItem.module.css";

const FriendListItem = ({ avatar, name, isOnline }) => {
  const onlineStatus = clsx({
    [css.isOnline]: isOnline,
    [css.isOffline]: !isOnline,
  });

  return (
    <div>
      <img className={css.avatarImage} src={avatar} alt="Avatar" width="48" />
      <p>{name}</p>
      <p className={onlineStatus}>{isOnline ? "Online" : "Offline"}</p>
    </div>
  );
};

export default FriendListItem;
