import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Box,
  Button,
  IconButton,
  InputBase,
  Menu,
  MenuItem,
  Avatar,
  Divider,
  ListItemIcon,
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  ListItemText,
  useTheme,
  Chip,
  CircularProgress,
  Typography,
} from "@mui/material";
import { styled, alpha } from "@mui/material/styles";
import {
  Search as SearchIcon,
  DarkMode,
  LightMode,
  Menu as MenuIcon,
  Home,
  TrendingUp,
  Favorite,
  Schedule,
  LocationOn,
  Settings,
  Logout,
  Person,
  Close,
  PostAdd,
  TrendingUp as TrpIcon,
  TrendingUp as UpIcon,
  TrendingDown as DownIcon,
  Timeline as TimelineIcon
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import { useThemeContext } from "../stores/ThemeContext";
import { useData } from "../stores/DataContext";
import { useLanguage } from "../stores/LanguageContext";
import { newsApi } from "../lib/api";

const Search = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.mode === "dark" ? "#fff" : "#000", 0.08),
  "&:hover": {
    backgroundColor: alpha(
      theme.palette.mode === "dark" ? "#fff" : "#000",
      0.12,
    ),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: "100%",
  transition: "width 0.3s ease",
  [theme.breakpoints.up("sm")]: {
    marginLeft: theme.spacing(3),
    width: "auto",
  },
}));

const SearchIconWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: "100%",
  position: "absolute",
  pointerEvents: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: theme.palette.text.secondary,
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: "inherit",
  width: "100%",
  "& .MuiInputBase-input": {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create("width"),
    width: "100%",
    [theme.breakpoints.up("md")]: {
      width: "30ch",
      "&:focus": {
        width: "40ch",
      },
    },
  },
}));

const navItems = [
  { label: "home", path: "/", icon: <Home /> },
  { label: "topNews", path: "/top-news", icon: <TrendingUp /> },
  { label: "likedNews", path: "/liked", icon: <Favorite /> },
  { label: "recentNews", path: "/recent", icon: <Schedule /> },
  { label: "localNews", path: "/local", icon: <LocationOn /> },
  { label: "settings", path: "/settings", icon: <Settings /> },
  { label: "trp", path: "/trp", icon: <TrpIcon /> },
];

const Header = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { mode, toggleTheme, isDark } = useThemeContext();
  const { user, isAuthenticated, isAdmin, logout } = useData();
  const { language, toggleLanguage, t } = useLanguage();

  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [trpData, setTrpData] = useState(null);
  const [trpLoading, setTrpLoading] = useState(true);
  const searchRef = useRef(null);
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  useEffect(() => {
    const fetchTRP = async () => {
      try {
        const response = await newsApi.getTRP();
        setTrpData(response.data);
      } catch (err) {
        console.error("Failed to fetch TRP:", err);
      } finally {
        setTrpLoading(false);
      }
    };
    fetchTRP();
  }, []);

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);
  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  const handleSearch = (e) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
    navigate("/");
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const drawer = (
    <Box sx={{ width: 250, pt: 2 }}>
      <Box
        sx={{
          px: 2,
          pb: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box
          sx={{ fontWeight: 700, fontSize: "1.25rem", fontFamily: "Poppins" }}
        >
          NewsHub
        </Box>
        <IconButton onClick={handleDrawerToggle}>
          <Close />
        </IconButton>
      </Box>
      <Divider />
      <List>
        {navItems.slice(0, 5).map((item) => (
          <ListItem
            button
            key={item.path}
            component={Link}
            to={item.path}
            onClick={handleDrawerToggle}
            sx={{
              bgcolor:
                location.pathname === item.path
                  ? "action.selected"
                  : "transparent",
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
            <ListItemText primary={t(item.label)} />
          </ListItem>
        ))}
        <ListItem
          button
          component={Link}
          to="/trp"
          onClick={handleDrawerToggle}
        >
          <ListItemIcon sx={{ minWidth: 40 }}>
            <TimelineIcon />
          </ListItemIcon>
          <ListItemText primary={t("TRP")} />
        </ListItem>
        {isAdmin && (
          <ListItem
            button
            component={Link}
            to="/admin"
            onClick={handleDrawerToggle}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <Settings />
            </ListItemIcon>
            <ListItemText primary={t("admin")} />
          </ListItem>
        )}
        {isAuthenticated && (
          <ListItem
            button
            component={Link}
            to="/submit"
            onClick={handleDrawerToggle}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <PostAdd />
            </ListItemIcon>
            <ListItemText primary={t("submitNews")} />
          </ListItem>
        )}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: alpha(theme.palette.background.paper, 0.9),
          borderBottom: 1,
          borderColor: "divider",
          backdropFilter: "blur(10px)",
        }}
      >
        <Toolbar sx={{ minHeight: 70, px: { xs: 1, sm: 3 } }}>
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 1, color: "text.primary" }}
            >
              <MenuIcon />
            </IconButton>
          )}

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Box
              component={Link}
              to="/"
              sx={{
                display: "flex",
                alignItems: "center",
                textDecoration: "none",
                fontWeight: 700,
                fontSize: "1.5rem",
                fontFamily: "Poppins",
                color: "primary.main",
                mr: 3,
              }}
            >
              NewsHub
            </Box>
          </motion.div>

          <Search
            ref={searchRef}
            sx={{
              flexGrow: 1,
              maxWidth: searchFocused || searchQuery ? 500 : 300,
              display: { xs: "none", sm: "block" },
            }}
          >
            <SearchIconWrapper>
              <SearchIcon />
            </SearchIconWrapper>
            <StyledInputBase
              placeholder={t("searchNews")}
              inputProps={{ "aria-label": "search" }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleSearch}
              onFocus={() => setSearchFocused(true)}
            />
          </Search>

          <Box sx={{ flexGrow: 1 }} />

          <Box
            sx={{
              display: { xs: "none", md: "flex" },
              alignItems: "center",
              gap: 1,
            }}
          >
            {navItems.slice(0, 5).map((item) => (
              <Button
                key={item.path}
                component={Link}
                to={item.path}
                sx={{
                  color: "text.primary",
                  fontWeight: location.pathname === item.path ? 600 : 400,
                  bgcolor:
                    location.pathname === item.path
                      ? "action.selected"
                      : "transparent",
                  "&:hover": { bgcolor: "action.hover" },
                }}
              >
                {t(item.label)}
              </Button>
            ))}
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1, ml: 1 }}>
            <Button
              onClick={toggleLanguage}
              variant="outlined"
              size="small"
              sx={{
                minWidth: "auto",
                px: 1.5,
                fontWeight: 600,
                borderColor: "divider",
              }}
              aria-label="toggle language"
            >
              {language === "en" ? "हिं" : "EN"}
            </Button>

            <motion.div
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.3 }}
            >
              <IconButton
                onClick={toggleTheme}
                sx={{ color: "text.primary" }}
                aria-label="toggle theme"
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={mode}
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0, rotate: 180 }}
                    transition={{ duration: 0.3 }}
                  >
                    {isDark ? <LightMode /> : <DarkMode />}
                  </motion.div>
                </AnimatePresence>
              </IconButton>
            </motion.div>

            <Box
              component={Link}
              to="/trp"
              sx={{
                display: { xs: "none", sm: "flex" },
                alignItems: "center",
                gap: 0.5,
                px: 1.5,
                py: 0.5,
                borderRadius: 1,
                bgcolor:
                  trpData?.trend === "up"
                    ? "success.main"
                    : trpData?.trend === "down"
                      ? "error.main"
                      : "warning.main",
                color: "#fff",
                textDecoration: "none",
                transition: "all 0.2s",
                "&:hover": {
                  bgcolor:
                    trpData?.trend === "up"
                      ? "success.dark"
                      : trpData?.trend === "down"
                        ? "error.dark"
                        : "warning.dark",
                },
              }}
            >
              {trpLoading ? (
                <CircularProgress size={16} sx={{ color: "#fff" }} />
              ) : (
                <>
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>
                    TRP: {trpData?.trp || 0}
                  </Typography>
                  {trpData?.trend === "up" && <UpIcon sx={{ fontSize: 14 }} />}
                  {trpData?.trend === "down" && (
                    <DownIcon sx={{ fontSize: 14 }} />
                  )}
                </>
              )}
            </Box>

            {isAuthenticated ? (
              <>
                <IconButton
                  onClick={handleMenuOpen}
                  sx={{ p: 0, ml: 1 }}
                  aria-label="user menu"
                >
                  <Avatar
                    src={user?.avatar}
                    alt={user?.username}
                    sx={{ bgcolor: "primary.main", width: 36, height: 36 }}
                  >
                    {user?.username?.charAt(0).toUpperCase()}
                  </Avatar>
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                  transformOrigin={{ horizontal: "right", vertical: "top" }}
                  anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
                  PaperProps={{
                    sx: { mt: 1, minWidth: 200 },
                  }}
                >
                  <Box sx={{ px: 2, py: 1.5 }}>
                    <Box sx={{ fontWeight: 600 }}>{user?.username}</Box>
                    <Box sx={{ fontSize: "0.875rem", color: "text.secondary" }}>
                      {user?.email}
                    </Box>
                  </Box>
                  <Divider />
                  <MenuItem
                    onClick={() => {
                      handleMenuClose();
                      navigate("/settings");
                    }}
                  >
                    <ListItemIcon>
                      <Person fontSize="small" />
                    </ListItemIcon>
                    {t("settings")}
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      handleMenuClose();
                      navigate("/liked");
                    }}
                  >
                    <ListItemIcon>
                      <Favorite fontSize="small" />
                    </ListItemIcon>
                    {t("likedNews")}
                  </MenuItem>
                  {isAdmin && (
                    <MenuItem
                      onClick={() => {
                        handleMenuClose();
                        navigate("/admin");
                      }}
                    >
                      <ListItemIcon>
                        <Settings fontSize="small" />
                      </ListItemIcon>
                      {t("admin")}
                    </MenuItem>
                  )}
                  <Divider />
                  <MenuItem onClick={handleLogout}>
                    <ListItemIcon>
                      <Logout fontSize="small" />
                    </ListItemIcon>
                    {t("logout")}
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <Box sx={{ display: "flex", gap: 1, ml: 1 }}>
                <Button
                  component={Link}
                  to="/login"
                  variant="outlined"
                  size="small"
                  sx={{ display: { xs: "none", sm: "flex" } }}
                >
                  {t("login")}
                </Button>
                <Button
                  component={Link}
                  to="/register"
                  variant="contained"
                  size="small"
                >
                  {t("register")}
                </Button>
              </Box>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": { boxSizing: "border-box", width: 250 },
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
};

export default Header;