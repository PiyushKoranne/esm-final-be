import { useNavigate, useLocation, createSearchParams } from "react-router-dom"
import { useState, useEffect, useContext, useRef, createRef } from 'react';
import userServices from "../services/userServices";
import parse, { attributesToProps, domToReact } from 'html-react-parser'
import { LoginContext } from "../App";
import reactDOMServer from 'react-dom/server';
import { TiArrowBack } from 'react-icons/ti';
import {MdKeyboardArrowDown} from 'react-icons/md';
import Meta from './Meta';
import { ErrorBoundary, useErrorBoundary } from "react-error-boundary";
import FallBack from "./FallBack";
import Footer from './Footer';
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import Header from './Header';
import validator from "validator";
import { useSnackbar } from 'notistack';
import "animate.css"
import {
    Accordion,
    AccordionItem,
    AccordionItemHeading,
    AccordionItemButton,
    AccordionItemPanel,
	
} from 'react-accessible-accordion';
import 'react-accessible-accordion/dist/fancy-example.css';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/scrollbar';
// import styles from "./Create.module.css"
import {Modal, Switch, Button} from "antd";
import Cropper, { ReactCropperElement } from "react-cropper";
import "cropperjs/dist/cropper.css";
import { dataUriToBuffer } from 'data-uri-to-buffer';
import { FileUploader } from "react-drag-drop-files";
import ReactCrop from 'react-image-crop'
// import Cropper from 'react-easy-crop'


import 'react-image-crop/dist/ReactCrop.css'
import { FaRegCircle, FaRegSquare } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import FullScreenLoader from "./common/FullScreenLoader";
import {isEqual} from 'lodash'
import isEmail from "validator/lib/isEmail";
import { BeatLoader } from "react-spinners";
import { BarLoader } from "react-spinners";

const Create = () => {

	const FACEBOOK_REGEXP=/^(https?:\/\/)?((w{3}\.)?)facebook.com\/.+/
	const INSTA_REGEXP=/^(https?:\/\/)?((w{3}\.)?)instagram.com\/.+/
	const TWITTER_REGEXP=/^(https?:\/\/)?((w{3}\.)?)twitter.com\/([a-zA-Z0-9_]{1,15})\/?/
	const LINKEDIN_REGEXP=/^(https?:\/\/)?((w{3}\.)?)linkedin.com\/(in\/[a-zA-Z0-9_-]+|company\/[a-zA-Z0-9_-]+)\/?/
	const YOUTUBE_REGEXP=/^(https?:\/\/)?((w{3}\.)?)youtube.com\/[a-zA-Z0-9_-]+\/?/
	const SKYPE_REGEXP=/^skype:[a-zA-Z0-9_.]+(\?chat)?/
	const WHATSAPP_REGEXP=/^(https?:\/\/)?wa\.me\/\d+/
	const PINTEREST_REGEXP=/^(https?:\/\/)?((w{3}\.)?)pinterest.com\/[a-zA-Z0-9_-]+\/?/
	const navigate = useNavigate();
	const { showBoundary } = useErrorBoundary();
	const { state } = useLocation();
	const { loggerData, setLoggerData } = useContext(LoginContext);
	const [templates, setTemplates] = useState([]);
	const [templateSwiper, setTemplateSwiper] = useState(null);
	const [filteredTemplates, setFilteredTemplates] = useState([]);
	const [chosenTemplateData, setChosenTemplateData] = useState({});
	const [swiperDisplay, setSwiperDisplay] = useState(false)
	const [tabber, setTabber] = useState('filter-template');
	const [imageLoading, setImageLoading] = useState(true);
	const [renderTrigger, setRenderTrigger] = useState(false);
	const [loading, setLoading] = useState(false);
	const [socialChecker, setSocialChecker] = useState({
		facebook: true,
		instagram: true,
		twitter: true,
		linkedin: true,
		youtube: false,
		skype: false,
		whatsapp: false,
		pinterest: false,
	});
	const userDataRef = useRef(null);
	const loggerRef = useRef(loggerData)
	const [whatsAppUrl,setWhatsAppUrl] = useState('');

	 
	const [cropperInstance, setCropperInstance] = useState(null);
	const { enqueueSnackbar } = useSnackbar();
	const [warning, setWarning] = useState({
		name:{status:false, message:""},
		designation:{status:false, message:""},
		email:{status:false, message:""}
	})
	// const [isModalOpen, setIsModalOpen] = useState(false);
	const [imageDetails, setImageDetails] = useState({name:"", mime:""});
	// const [image, setImage] = useState("");
	const [cropData, setCropData] = useState("#");
	const [cropperDimensions, setCropperDimensions] = useState({width:"", height:""})
	const cropperRef = createRef();
	const [visited, setVisited] = useState({
		profile:false,
		banner:false,
		cta:false,
		social:false,
		details:false
	});

	const [ctaDisplay, setCtaDisplay] = useState({
		disclaimer: false,
		quote: false,
		appLink: false,
		video: false,
		feedback: false,
		banner: false
	})

	const [initialValues, setInitialValues] = useState({
		facebook: 'Ex: https://facebook/',
		instagram: 'Ex: https://instagram.com/',
		twitter: 'Ex: https://twitter.com/',
		linkedIn: 'Ex: https://linkedin.com/',
		youtube: '',
		skype: '',
		whatsapp: '',
		pinterest: '',
	})
	

	// CROPPER RELATED FUNCTIONS 
	const [crop, setCrop] = useState({x:0, y:0})
	const [src, setFile] = useState(null);
	const [image, setImage] = useState(null);
	const [cricular, setCircular] = useState(false);
	const [saving, setSaving] = useState(false);
	const handleFileChange = (e) => {
		console.log('WHile CHaning file ',e)	
		setImageDetails({name:e.name, mime:e.type})
		setFile(URL.createObjectURL(e))
	} 

	const handleImageLoad = (e) => {
		setImage(e.target)
		const aspect = 1; // You can set the desired aspect ratio here
		// Calculate the initial crop box position to center it
		const width = e.target.width;
		const height = e.target.height;
		const x = (e.target.width - width) / 2;
		const y = (e.target.height - height) / 2;

		setCrop({ unit: 'px', x:0, y:0, width, height });

	}
	const handleCircularCrop = () => {
		try {
			if(!image) return 
			const width = image.width/2;
			const height = image.width/2;
			const x = (image.width - width) / 2;
			const y = (image.height - height) / 2;
			const aspect = 1;
			setCrop({ unit: 'px', aspect:aspect, x:x, y:y, width, height });
			setCircular(true);

		} catch (error) {
			console.log(error)
		}
	}
	const handleSquareCrop = () => {
		try {
			if(!image) return 
			const width = image.width/2;
			const height = image.width/2;
			const x = (image.width - width) / 2;
			const y = (image.height - height) / 2;
			const aspect = 1;
			setCrop({ unit: 'px', aspect:aspect, x:x, y:y, width, height });
			setCircular(false);

		} catch (error) {
			console.log(error)
		}
	}
	const [isModalOpen, setIsModalOpen] = useState(false);
	const showModal = () => {
	  setIsModalOpen(true);
	};

	const handleOk = () => {
		if(!image){
			return;
		}
	  setIsModalOpen(false);
	  const canvas = document.createElement('canvas');
	  const scaleX = image.naturalWidth / image.width;
	  const scaleY = image.naturalHeight / image.height;
	  canvas.width = crop.width
	  canvas.height = crop.height;
	  const ctx = canvas.getContext('2d');
	  ctx.drawImage(
		image, 
		crop.x * scaleX,
		crop.y * scaleY,
		crop.width * scaleX,
		crop.height * scaleY,
		0,0,
		crop.width,
		crop.height
	  )
	  const base64Image = canvas.toDataURL();
		handleImageUpload(base64Image);
		// setImage(null);
		// setFile(null);
	};

	const handleCancel = () => {
	  setIsModalOpen(false);
	};

	const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image()
    image.addEventListener('load', () => resolve(image))
    image.addEventListener('error', (error) => reject(error))
    image.setAttribute('crossOrigin', 'anonymous') // needed to avoid cross-origin issues on CodeSandbox
    image.src = url
  })
   function getRadianAngle(degreeValue) {
	return (degreeValue * Math.PI) / 180
  }
  
  /**
   * Returns the new bounding area of a rotated rectangle.
   */
   function rotateSize(width, height, rotation) {
	const rotRad = getRadianAngle(rotation)
  
	return {
	  width:
		Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
	  height:
		Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
	}
  }

	// ENDS

	/** Image Cropper END **/

	const preCode = `<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN"><html><head><title>Email Signature</title><meta content="text/html; charset=utf-8" http-equiv="Content-Type"><style type="text/css">*{margin:0px;padding:0px;box-sizing:content-box;} .ii a[href]{ color:#000 !important; text-decoration:none !important;} table{border-collapse:separate}a,a:link,a:visited{text-decoration:none;color:#00788a}a:hover{text-decoration:underline}.t_cht,h2,h2 a,h2 a:visited,h3,h3 a,h3 a:visited,h4,h5,h6{color:#000!important}.ExternalClass font,.ExternalClass p,.ExternalClass span,.ExternalClass td{line-height:100%}.ExternalClass{width:100%}</style></head><body>`
	const postCode = `</body></html>`
	const [stateCategories, setStateCategories] = useState([]);
	const [userData, setUserData] = useState({});
	const [trigger, setTrigger] = useState(false)
	const sign_ref = useRef(null);
	const options = {
		replace: domNode => {
			try {
				let props;
				switch (domNode.attribs && domNode.attribs.id) {
					// Handling Display Cases - START
					case ('link-facebook-blk'):
						props = attributesToProps(domNode.attribs);
						if(socialChecker?.facebook){
							props.style.display = 'inline-block'
						} else {
							props.style.display = 'none'
						}
						return <span {...props}>{domToReact(domNode.children, options)}</span>
					case ('link-skype-blk'):
						props = attributesToProps(domNode.attribs);
						if(socialChecker?.skype){
							props.style.display = 'inline-block'
						} else {
							props.style.display = 'none'
						}
						return <span {...props}>{domToReact(domNode.children, options)}</span>
					case ('link-whatsapp-blk'):
						props = attributesToProps(domNode.attribs);
						if(socialChecker?.whatsapp){
							props.style.display = 'inline-block'
						} else {
							props.style.display = 'none'
						}
						return <span {...props}>{domToReact(domNode.children, options)}</span>
					case ('link-linkedIn-blk'):
						props = attributesToProps(domNode.attribs);
						if(socialChecker?.linkedin){
							props.style.display = 'inline-block'
						} else {
							props.style.display = 'none'
						}
						return <span {...props}>{domToReact(domNode.children, options)}</span>
					case ('link-twitter-blk'):
						props = attributesToProps(domNode.attribs);
						if(socialChecker?.twitter){
							props.style.display = 'inline-block'
						} else {
							props.style.display = 'none'
						}
						return <span {...props}>{domToReact(domNode.children, options)}</span>
					case ('link-instagram-blk'):
						props = attributesToProps(domNode.attribs);
						if(socialChecker?.instagram){
							props.style.display = 'inline-block'
						} else {
							props.style.display = 'none'
						}
						return <span {...props}>{domToReact(domNode.children, options)}</span>
					case ('link-pinterest-blk'):
						props = attributesToProps(domNode.attribs);
						if(socialChecker?.pinterest){
							props.style.display = 'inline-block'
						} else {
							props.style.display = 'none'
						}
						return <span {...props}>{domToReact(domNode.children, options)}</span>
					case ('link-youtube-blk'):
						props = attributesToProps(domNode.attribs);
						if(socialChecker?.youtube){
							props.style.display = 'inline-block'
						} else {
							props.style.display = 'none'
						}
						return <span {...props}>{domToReact(domNode.children, options)}</span>
					case ('banner-blk'):
						props = attributesToProps(domNode.attribs);
						if (visited?.banner || ctaDisplay?.banner) {
							props.class = 'animate__animated animate__fadeIn'
							props.style.display = 'table'
						} else {
							props.style.display = 'none'
						}
						return <table {...props}>{domToReact(domNode.children, options)}</table>
					case ('logo-name-blk'):
						props = attributesToProps(domNode.attribs);
						if (!userData.logoName) {
							props.style.display = 'none'
						} else {
							props.style.display = 'inline-block'
						}
						return <span {...props}>{domToReact(domNode.children, options)}</span>
					case ('designation-blk'):
						props = attributesToProps(domNode.attribs);
						if(loggerData?.isLoggedIn){
							if(loggerData?.userData?.designation){
								props.style.display = 'inline-block'
							} else if(loggerData?.userData?.designation === ""){
								props.style.display = 'none'
							} else {
								props.style.display = 'inline-block'
							}
						} else {
							if(userData?.designation){
								props.style.display = 'inline-block'
							} else if(userData?.designation === ""){
								props.style.display = 'none'
							} 
							else if (initialValues?.designation){
								props.style.display = 'inline-block'
							}
						}
						return <span {...props}>{domToReact(domNode.children, options)}</span>
					case ('phone-blk'):
						props = attributesToProps(domNode.attribs);
						if(loggerData?.isLoggedIn){
							if(loggerData?.userData?.phone){
								props.style.display = 'inline-block'
							} else if(loggerData?.userData?.phone === ""){
								props.style.display = 'none'
							} else {
								props.style.display = 'inline-block'
							}
						} else {
							if(userData?.phone){
								props.style.display = 'inline-block'
							} else if(userData?.phone === ""){
								props.style.display = 'none'
							} 
							else if (initialValues?.phone){
								props.style.display = 'inline-block'
							}
						}
						return <span {...props}>{domToReact(domNode.children, options)}</span>
					case ('email-blk'):
						props = attributesToProps(domNode.attribs);
						if(loggerData?.isLoggedIn){
							if(loggerData?.userData?.email){
								props.style.display = 'inline-block'
							} else if(loggerData?.userData?.email === ""){
								props.style.display = 'none'
							} else {
								props.style.display = 'inline-block'
							}
						} else {
							if(userData?.email){
								props.style.display = 'inline-block'
							} else if(userData?.email === ""){
								props.style.display = 'none'
							} 
							else if (initialValues?.email){
								props.style.display = 'inline-block'
							}
						}
						return <span {...props}>{domToReact(domNode.children, options)}</span>
					case ('your-addr-blk'):
						props = attributesToProps(domNode.attribs);
						if(loggerData?.isLoggedIn){
							if(loggerData?.userData?.location){
								props.style.display = 'inline-block'
							} else if(loggerData?.userData?.location === ""){
								props.style.display = 'none'
							} else if(!loggerData?.userData?.location) {
								props.style.display = 'inline-block'
							}
						} else {
							if(userData?.location){
								props.style.display = 'inline-block'
							} else if(userData?.location === ""){
								props.style.display = 'none'
							} 
							else if (initialValues?.location){
								props.style.display = 'inline-block'
							}
						}
						return <span {...props}>{domToReact(domNode.children, options)}</span>
					case ('location-blk'):
						props = attributesToProps(domNode.attribs);
						if(loggerData?.isLoggedIn){
							if(loggerData?.userData?.location){
								props.style.display = 'inline-block'
							} else if(loggerData?.userData?.location === ""){
								props.style.display = 'none'
							} else {
								props.style.display = 'inline-block'
							}
						} else {
							if(userData?.location){
								props.style.display = 'inline-block'
							} else if(userData?.location === ""){
								props.style.display = 'none'
							} 
							else if (initialValues?.location){
								props.style.display = 'inline-block'
							}
						}
						return <span {...props}>{domToReact(domNode.children, options)}</span>
					case ('website-blk'):
						props = attributesToProps(domNode.attribs);
						if(loggerData?.isLoggedIn){
							if(loggerData?.userData?.website){
								props.style.display = 'inline-block'
							} else if(loggerData?.userData?.website === ""){
								props.style.display = 'none'
							} else {
								props.style.display = 'inline-block'
							}
						} else {
							if(userData?.website){
								props.style.display = 'inline-block'
							} else if(userData?.website === ""){
								props.style.display = 'none'
							} 
							else if (initialValues?.website){
								props.style.display = 'inline-block'
							}
						}
						return <span {...props}>{domToReact(domNode.children, options)}</span>
					case ('disclaimer-blk'):
						props = attributesToProps(domNode.attribs);
						if (userData.disclaimer || ctaDisplay?.disclaimer) {
							props.class = 'animate__animated animate__fadeIn'
							props.style.display = 'table'
						} else {
							props.class = 'animate__animated animate__fadeIn'
							props.style.display="none"
						}
						return <table {...props}>{domToReact(domNode.children, options)}</table>
					case ('quote-blk'):
						props = attributesToProps(domNode.attribs);
						if (userData.quote || ctaDisplay?.quote) {
							props.class = 'animate__animated animate__fadeIn'
							props.style.display = 'table'
						} else {
							props.style.display = 'none'
						}
						return <table {...props}>{domToReact(domNode.children, options)}</table>
					case ('app-link-blk'):
						props = attributesToProps(domNode.attribs);
						if (userData?.appleStoreAppLink || userData?.playStoreAppLink || ctaDisplay?.appLink) {
							props.class = 'animate__animated animate__fadeIn'
							props.style.display = 'table'
						} else {
							props.style.display = 'none'
						}
						return <table {...props}>{domToReact(domNode.children, options)}</table>
					case ('feedback-blk'):
						props = attributesToProps(domNode.attribs);
						if (userData.feedback || ctaDisplay.feedback) {
							props.class = 'animate__animated animate__fadeIn'
							props.style.display = 'table'
						} else {
							props.style.display = 'none'
						}
						return <table {...props}>{domToReact(domNode.children, options)}</table>
					case ('video-blk'):
						props = attributesToProps(domNode.attribs);
						if (userData.video || ctaDisplay.video) {
							props.class = 'animate__animated animate__fadeIn'
							props.style.display = 'table'
						} else {
							props.style.display = 'none'
						}
						return <table {...props}>{domToReact(domNode.children, options)}</table>
					// case ('custom-blk'):
					// 	props = attributesToProps(domNode.attribs);
					// 	if (!userData.custom) {
					// 		props.style.display = 'none'
					// 	} else {
					// 		props.style.display = 'inline-block'
					// 	}
					// 	return <span {...props}>{domToReact(domNode.children, options)}</span>
					case ('profile-pic-blk'):
						props = attributesToProps(domNode.attribs);
						if (userData.profileImage || initialValues?.profileImage) {
							props.style.display = 'inline-block'
						} else {
							props.style.display = 'none'
						}
						return <span {...props}>{domToReact(domNode.children, options)}</span>
					// Handling Edit Cases - START
					case ('full-name'):
						props = attributesToProps(domNode.attribs);
						return <span {...props}>{
							userData.fullName ? userData?.fullName : userData?.fullName === "" ? userData?.fullName : initialValues?.fullName
							}</span>;
					case ('logo-name'):
						props = attributesToProps(domNode.attribs);
						return <span {...props}>{userData.logoName || initialValues?.logoName}</span>;
					case ('designation'):
						props = attributesToProps(domNode.attribs);
						return <span {...props}>{userData.designation ? userData?.designation : userData?.designation === "" ? userData?.designation : initialValues?.designation}</span>;
					case ('phone'):
						props = attributesToProps(domNode.attribs);
						return <span {...props}>{userData.phone ? userData?.phone : userData?.phone === "" ? userData?.phone : initialValues?.phone}</span>;
					case ('email'):
						props = attributesToProps(domNode.attribs);
						return <span {...props}>{userData.email ? userData?.email : userData?.email === "" ? userData?.email : initialValues?.email}</span>;
					case ('your-addr'):
						props = attributesToProps(domNode.attribs);
						return <span {...props}>{userData.location ? userData?.location : userData?.location === "" ? userData?.location : initialValues?.location}</span>;
					case ('website'):
						props = attributesToProps(domNode.attribs);
						return <span {...props}>{userData.website ? userData?.website : userData?.website === "" ? userData?.website : initialValues?.website}</span>;
					case ('disclaimer'):
						props = attributesToProps(domNode.attribs);
						return <span {...props}>{userData.disclaimer ? userData?.disclaimer: userData?.disclaimer === "" ? userData?.disclaimer : domToReact(domNode.children, options) }</span>;
					case ('video-title'):
						props = attributesToProps(domNode.attribs);
						return <span {...props}>{userData.video_title || domToReact(domNode.children, options)}</span>;
					case ('profile-pic'):
						if (userData.profileImage) {
							domNode.attribs.src = process.env.REACT_APP_BACKEND_URL + '/profile/' + userData.profileImage;
						} else if (initialValues?.profileImage){
							domNode.attribs.src = process.env.REACT_APP_BACKEND_URL + '/profile/' + initialValues.profileImage;
						}
						props = attributesToProps(domNode.attribs);
						return <img {...props} alt="profile" />
					case ('banner'):
						if (userData.banner) {
							domNode.attribs.src = process.env.REACT_APP_BACKEND_URL + '/banners/' + userData.banner;
						} else if(initialValues?.banner){
							domNode.attribs.src = process.env.REACT_APP_BACKEND_URL + '/banners/' + initialValues.banner;
						}
						props = attributesToProps(domNode.attribs);
						return <img {...props} alt="banner" />
					case ('video-img'):
						if (userData.video) {
							domNode.attribs.src = userData.video_img;
						}
						props = attributesToProps(domNode.attribs);
						return <img {...props} alt="video" />
					case ('link-facebook'):
						if (userData.facebook) {
							domNode.attribs.href = userData.facebook.startsWith('placeholder') ? '#' : userData.facebook;
						} else if (initialValues?.facebook){
							domNode.attribs.href = initialValues.facebook.startsWith('placeholder') ? '#' : initialValues.facebook;
						}
						props = attributesToProps(domNode.attribs);
						return <a {...props}>{domToReact(domNode.children, options)}</a>
					case ('link-skype'):
						if (userData.skype) {
							domNode.attribs.href = userData.skype.startsWith('placeholder') ? '#' : userData.skype;
						} else if(initialValues?.skype){
							domNode.attribs.href = initialValues.skype.startsWith('placeholder') ? '#' : initialValues.skype;
						}
						props = attributesToProps(domNode.attribs);
						return <a {...props}>{domToReact(domNode.children, options)}</a>
					case ('link-whatsapp'):
						if (userData.whatsapp) {
							domNode.attribs.href = userData.whatsapp.startsWith('placeholder') ? '#' : whatsAppUrl;
						} else if (initialValues?.whatsapp){
							domNode.attribs.href = initialValues.whatsapp.startsWith('placeholder') ? '#' : initialValues.whatsapp;
						}
						props = attributesToProps(domNode.attribs);
						return <a {...props}>{domToReact(domNode.children, options)}</a>
					case ('link-instagram'):
						if (userData.instagram) {
							domNode.attribs.href = userData.instagram.startsWith('placeholder') ? '#' : userData.instagram;
						} else if (initialValues?.instagram){
							domNode.attribs.href = initialValues.instagram.startsWith('placeholder') ? '#' : initialValues.instagram;
						}
						props = attributesToProps(domNode.attribs);
						return <a {...props}>{domToReact(domNode.children, options)}</a>
					case ('link-pinterest'):
						if (userData.pinterest) {
							domNode.attribs.href = userData.pinterest.startsWith('placeholder') ? '#' : userData.pinterest;
						} else if (initialValues?.pinterest){
							domNode.attribs.href = initialValues.pinterest.startsWith('placeholder') ? '#' : initialValues.pinterest;
						}
						props = attributesToProps(domNode.attribs);
						return <a {...props}>{domToReact(domNode.children, options)}</a>
					case ('link-youtube'):
						if (userData.youtube) {
							domNode.attribs.href = userData.youtube.startsWith('placeholder') ? '#' : userData.youtube;
						} else if(initialValues?.youtube){
							domNode.attribs.href = initialValues.youtube.startsWith('placeholder') ? '#' : initialValues.youtube;
						}
						props = attributesToProps(domNode.attribs);
						return <a {...props}>{domToReact(domNode.children, options)}</a>
					case ('link-twitter'):
						if (userData.twitter) {
							domNode.attribs.href = userData.twitter.startsWith('placeholder') ? '#' : userData.twitter;
						} else if(initialValues?.twitter){
							domNode.attribs.href = initialValues.twitter.startsWith('placeholder') ? '#' : initialValues.twitter;
						}
						props = attributesToProps(domNode.attribs);
						return <a {...props}>{domToReact(domNode.children, options)}</a>
					case ('link-linkedIn'):
						if (userData.linkedIn) {
							domNode.attribs.href = userData.linkedIn.startsWith('placeholder') ? '#' : userData.linkedIn;
						} else if(initialValues?.linkedIn){
							domNode.attribs.href = initialValues.linkedIn.startsWith('placeholder') ? '#' : initialValues.linkedIn;
						}
						props = attributesToProps(domNode.attribs);
						return <a {...props}>{domToReact(domNode.children, options)}</a>
					case ('playstore-app-link'):
						if (userData.playStoreAppLink) {
							domNode.attribs.href = userData.playStoreAppLink;
						} else {
							domNode.attribs.href = "#";
						}
						props = attributesToProps(domNode.attribs);
						return <a {...props}>{domToReact(domNode.children, options)}</a>
					case ('apple-app-link'):
						if (userData.appleStoreAppLink) {
							domNode.attribs.href = userData.appleStoreAppLink;
						} else {
							domNode.attribs.href = "#";
						}
						props = attributesToProps(domNode.attribs);
						return <a {...props}>{domToReact(domNode.children, options)}</a>
					case ('feedback-link'):
						if (userData.feedback) {
							domNode.attribs.href = userData.feedback;
						} else {
							domNode.attribs.href = '#';
						}
						props = attributesToProps(domNode.attribs);
						return <a {...props}>{domToReact(domNode.children, options)}</a>
					case ('video'):
						if (userData.video) {
							domNode.attribs.href = userData.video;
						} else {
							domNode.attribs.href = '#';
						}
						props = attributesToProps(domNode.attribs);
						return <a {...props}>{domToReact(domNode.children, options)}</a>
					case ('quote'):
						props = attributesToProps(domNode.attribs);
						return <span {...props}>{userData?.quote ? '"'+userData?.quote+'"' : userData?.quote === "" ? userData?.quote : domToReact(domNode.children, options)}</span>;
					default:
				}
			} catch (error) {
				console.log(error.message);
				showBoundary(error);
			}
		}
	};
	const ctaCollapseItems = [
		{
			key: '1',
			label: 'Disclaimer',
			children: <div
			className="create-name form-field"
		>
			<label className="fieldset">
				<img className="img-generic" src="assets/images/disclaimer-icon.svg" alt="disclaimer" />
				<span>Disclaimer</span>
			</label>
			<textarea
				onFocus={(e) => { e.target.select() }}
				maxLength="1000"
				onChange={(e) => { 
					if(Object.keys(chosenTemplateData).length > 0) { 
						setUserData(prev => ({ ...prev, disclaimer: e.target.value?.slice(0,1000), visited:{...prev.visited, cta:true} })); 
						setLoggerData(prev=>({...prev, userData:{...prev.userData, disclaimer:e.target.value.slice(0,1000)}}))
						setVisited(prev =>({...prev, cta:true}));
					} 
				}}
				style={{height:'150px', width:'100%',  padding:"15px 10px 10px 10px",fontFamily:'Trebuchet MS', resize:'none', outline:'none', border:'none',paddingTop:'20px'}}
				type="text"
				name="create-disclaimer"
				autoComplete="off"
				placeholder="Write disclaimer here"
			>{userData?.disclaimer}</textarea>
		</div>,
		},
		{
			key:'2',
			label:'Quote',
			children:<div
			className="create-job-title form-field"
		>
			<label className="fieldset"><img className="img-generic" src="assets/images/form-quote-icon.svg" alt="quote" /><span>Quote</span></label>
			<textarea
				onFocus={(e) => { e.target.select() }}
				maxLength="500"
				onChange={(e) => {
					if (Object.keys(chosenTemplateData).length > 0) {
						setUserData(prev => ({ ...prev, quote: e.target.value?.slice(0, 500), visited:{...prev.visited, cta:true} }));
						setLoggerData(prev => ({ ...prev, userData: { ...prev.userData, quote: e.target.value?.slice(0, 500) } }))
						setVisited(prev =>({...prev, cta:true}));
					}
				}}
				style={{height:'150px', width:'100%',  padding:"15px 10px 10px 10px", fontFamily:"Trebuchet MS", resize:'none', border:'none', outline:'none', paddingTop:'20px'}}
				type="text"
				name="create-quote"
				autoComplete="off"
				placeholder="Write Quote Here">{userData?.quote}</textarea>
		</div>
		},
		{
			key:'3',
			label:'Video',
			children:<div
			className="create-company form-field"
			>
			<label className="fieldset"><img className="img-generic" src="assets/images/form-vid-icon.svg" alt="video-img" /><span>Video</span></label>
			<input
				onFocus={(e) => { e.target.select() }}
				maxLength="200"
				onChange={(e) => {
					if (Object.keys(chosenTemplateData).length > 0) {
						youtube_parser(e.target.value);
						setVisited(prev =>({...prev, cta:true}))
						setUserData(prev => ({...prev, visited:{...prev.visited, cta:true}}))
					}
				}}
				type="text"
				name="create-video"
				autoComplete="off"
				placeholder="Video Link" />
		</div>
		},
		{
			key:'4',
			label:'Banner',
			children:
			<>
				<div className="image-info-blk">
					<img src="assets/images/icons8-information.svg" width={24} height={24} alt="info icon" />
					<p>{`Please upload a banner of width 600px`}</p>
				</div>
				<div
					className="create-phone upload-banner-field form-field"
				>
					<span className="upload-banner-span">Upload Banner </span>
					<label className="fieldset"><img className="img-generic" src="assets/images/form-upload-icon-last.svg" alt="banner" /><span>Upload Banner</span></label>
					<input
						type="file"
						style={{ color: !chosenTemplateData?.cta_data?.banner && '#DDE6ED' }}
						onChange={(e) => { Object.keys(chosenTemplateData).length > 0 && handleLogoUpload(e); setVisited(prev =>({...prev, cta:true})); setUserData(prev => ({...prev, visited:{...prev.visited, cta:true}})) }}
						name="create-upload-banner" 
					/>
				</div>
				{
					userData?.banner && (
						<div style={{position:'relative',padding:'20px 8px 8px 8px'}}>
							<span style={{display:'inline-block', position:'absolute', top:'4px', fontSize:'12px', color:'#484848'}}>Current Banner :</span>
							<p style={{fontSize:'14px', width:'80%', overflow:'hidden', textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{userData?.banner}</p>
							<button style={{position:'absolute', top:'15px', right:'8px', border:'none', background:'transparent'}} onClick={()=>{setUserData(prev => ({...prev, banner:""})); setLoggerData(prev => ({...prev, userData:{...prev.userData, banner:""}})); setCtaDisplay(prev =>({...prev, banner:false})); setVisited(prev=>({...prev, banner:false})) }} ><img src="assets/images/close-square-svgrepo-com.svg" alt="delete" width={24} /></button>
						</div>
					)
				}
			</>
		},
		{
			key:'5',
			label:'App Link',
			children:
			<>
				<div
				className="create-email form-field"
			>
				<label className="fieldset"><img className="img-generic" src="assets/images/app-download-playstore.svg" alt="playstore" width="24px" /><span>Download App</span></label>
				<input
					onFocus={(e) => { e.target.select() }}
					maxLength="200"
					onChange={(e) => {
						if (Object.keys(chosenTemplateData).length > 0) {
							setUserData(prev => ({ ...prev, playStoreAppLink: e.target.value?.slice(0, 200) }));
							setLoggerData(prev => ({ ...prev, userData: { ...prev.userData, playStoreAppLink: e.target.value?.slice(0, 200) } }));
							setVisited(prev =>({...prev, cta:true}))
							setUserData(prev => ({...prev, visited:{...prev.visited, cta:true}}))
						}
					}}
					value={userData?.playStoreAppLink}
					type="text"
					name="create-download-link"
					autoComplete="off"
					placeholder="Playstore Link"
				/>
			</div>
			<div className="create-email form-field">
				<label className="fieldset"><img className="img-generic" src="assets/images/app-download-apple.svg" alt="apple-store" width="24px" /><span>Download App</span></label>
				<input
					onFocus={(e) => { e.target.select() }}
					maxLength="200"
					onChange={(e) => {
						if (Object.keys(chosenTemplateData).length > 0) {
							setUserData(prev => ({ ...prev, appleStoreAppLink: e.target.value?.slice(0, 200) }));
							setLoggerData(prev => ({ ...prev, userData: { ...prev.userData, appleStoreAppLink: e.target.value?.slice(0, 200) } }));
							setVisited(prev =>({...prev, cta:true}))
							setUserData(prev => ({...prev, visited:{...prev.visited, cta:true}}))
						}
					}}
					value={userData?.appleStoreAppLink}
					type="text"
					name="create-download-link"
					autoComplete="off"
					placeholder="App Link"
				/>
			</div>
		</>
		},
		{
			key:'6',
			label:'Feedback',
			children:<div
			className="create-website form-field"
		>
			<label className="fieldset"><img className="img-generic" src="assets/images/form-custom.svg" alt="feedback" /><span>Feedback Link</span></label>
			<input
				onFocus={(e) => { e.target.select() }}
				maxLength="200"
				disabled={!chosenTemplateData?.cta_data?.feedback}
				style={{ color: !chosenTemplateData?.cta_data?.feedback && '#DDE6ED' }}
				onChange={(e) => {
					if (Object.keys(chosenTemplateData).length > 0) {
						setUserData(prev => ({ ...prev, feedback: e.target.value?.slice(0, 300) }));
						setLoggerData(prev => ({ ...prev, userData: { ...prev.userData, feedback: e.target.value?.slice(0, 300) } }));
						setVisited(prev =>({...prev, cta:true}))
						setUserData(prev => ({...prev, visited:{...prev.visited, cta:true}}))
					}
				}}
				value={userData?.feedback}
				type="text"
				name="create-feedback"
				autoComplete="off"
				placeholder="Provide Feedback Link"
			/>
		</div>
		}
	]

	async function fetchCategories() {
		try {
			const result = await userServices.getCategories();
			if (result.status === 200) {
				setStateCategories(result?.data?.categories);
			}
		} catch (error) {
			console.log('Some error occurred in fetchCategories.', error)
		}
	}

	async function fetchTemplates(start) {
		try {
			const data = await userServices.getTemplates({ start_count: start });
			if (data?.status === 200 && data?.data?.success === true) {
				setTemplates(data?.data?.data);
				setFilteredTemplates(data?.data?.data);
			} else {
				console.log('Template Null')
			}
		} catch (error) {
			console.log('Some error occurred in fetchTemplates function.', error);
			enqueueSnackbar('Failed to get templates', {
				variant: 'customError',
				autoHideDuration:2000
			})
		}
	}

	const handletemplateCategory = (e) => {
		if (e.target.value === 'All') {
			setFilteredTemplates(templates);
			return;
		} else {
			setFilteredTemplates(templates?.filter(item => (item.category === e.target.value)));
		}
	};

	const validateTabberChange = (tabData, editMode) => {
		// first see what the tabData is , and then apply relevant filters:
		if(editMode === true){
			if (tabData === 'filter-template') {
				setTabber(tabData);
			}
			if (tabData === 'filter-social') {
				// first check if name is filled
				let allow = 0;
				let errorFlag = false;

				/** START NAME VALIDATION */
				// let elem = document.getElementById('name-required');
				// let designationElem = document.getElementById('designation-required');
				// let emailElem = document.getElementById('email-required');

				if(userData?.fullName){
					allow+=1;
					setWarning(prev =>({...prev, name:{status:false, message:""}}));
				} else {
					errorFlag = true;
					setWarning(prev =>({...prev, name:{status:true, message:"Please fill your name"}}))
				}
				/** END NAME VALIDATION */

				/** START DESIGNATION VALIDATION */
				if(userData?.designation){
					allow+=1;
					setWarning(prev =>({...prev, designation:{status:false, message:""}}));
				} else {
					errorFlag = true;
					setWarning(prev =>({...prev, designation:{status:true, message:"Please fill your designation"}}));
				}
				/** END DESIGNATION VALIDATION */

				/** START EMAIL VALIDATION */
				if(userData?.email && isEmail(userData?.email)){
					allow+=1;
					setWarning(prev =>({...prev, email:{status:false, message:""}}));
				} else {
					errorFlag = true;
					setWarning(prev =>({...prev, email:{status:true, message:"Please fill your email"}}));
				}
				/** END EMAIL VALIDATION */

				if(allow === 3){
					setTabber(tabData);
					setVisited(prev =>({...prev, social:true}));
					setUserData(prev =>({...prev, visited:{...prev.visited, details:true, social:true}}));
				}
				if(errorFlag){
					enqueueSnackbar('Please fill all the necessary fields. Full Name, Email and Designation are required for the email template', {
						variant:"customWarning"
					})
					errorFlag = false;
				}
				
					/** END EMAIL VALIDATION */
					
			}
			if (tabData === 'filter-cta') {
				// first check if name is filled
				let allow = 0;
				let errorFlag = false;
				/** START NAME VALIDATION */
				// let elem = document.getElementById('name-required');
				// let designationElem = document.getElementById('designation-required');
				// let emailElem = document.getElementById('email-required');

				if(userData?.fullName){
					allow+=1;
					setWarning(prev =>({...prev, name:{status:false, message:""}}));
				} else {
					errorFlag = true;
					setWarning(prev =>({...prev, name:{status:true, message:"Please fill your name"}}))
				}
				/** END NAME VALIDATION */

				/** START DESIGNATION VALIDATION */
				if(userData?.designation){
					allow+=1;
					setWarning(prev =>({...prev, designation:{status:false, message:""}}));
				} else {
					errorFlag = true;
					setWarning(prev =>({...prev, designation:{status:true, message:"Please fill your designation"}}));
				}
				/** END DESIGNATION VALIDATION */

				/** START EMAIL VALIDATION */
				if(userData?.email && isEmail(userData?.email)){
					allow+=1;
					setWarning(prev =>({...prev, email:{status:false, message:""}}));
				} else {
					errorFlag = true;
					setWarning(prev =>({...prev, email:{status:true, message:"Please fill your email"}}));
				}
				/** END EMAIL VALIDATION */
				if(allow === 3){
					setTabber(tabData);
					setVisited(prev =>({...prev, social:true}))
					setUserData(prev =>({...prev, visited:{...prev.visited, details:true, social:true}}));
				}
				if(errorFlag){
					enqueueSnackbar('Please fill all the necessary fields. Full Name, Email and Designation are required for the email template', {
						variant:"customWarning"
					})
					errorFlag = false;
				}
					/** END EMAIL VALIDATION */
			}
			else if (tabData === 'filter-details') {
				// check if a template has been chosen
				if(Object.values(chosenTemplateData).length > 0){
					setTabber(tabData)
				} else {
					enqueueSnackbar('Please Choose a Template', {
						variant:'customWarning'
					})
				}
			}
		} else {
			setTabber(tabData)
		}
	}

	function handleTabber() {
		for (let element of document.getElementsByClassName('tabber-content')) {
			if (element.classList.contains(tabber)) {
				element.classList.remove('hide');
			} else {
				element.classList.add('hide');
			}
		}

	}


	function getSignature() {
		try {
			if (sign_ref.current) {
				const temp = sign_ref.current.replace(/(\r\n|\n|\r)/gm, "")
				try {
					const node = parse(temp, options);
					const node_text = reactDOMServer.renderToString(node);
					sign_ref.current = node_text;
					return node;

				} catch (error) {
					return <></>
				}
			} else {
				return <></>
			}
		} catch (error) {
			showBoundary(error);
		}
	}



	function chooseTemplate(template) {
		setLoggerData(prev =>({...prev, template_id:template?._id}))
		navigate({ pathname: '/create', search: createSearchParams({ template_id: template._id }).toString() });
		setTrigger(prev => !prev);
	}

	// useEffect(()=>{
	// 	if(localStorage.getItem("template_id")){
	// 		navigate({ pathname: '/create', search: createSearchParams({ template_id: localStorage.getItem('template_id')?.replace(/["']/g, '') }).toString() });
	// 	}
	// },[window.location.pathname])

	console.log('\n\n\n\n\n\n\n')
	console.log('###### TEMPLATE DATA ######');
	console.log('USERDATA',userData)
	console.log('INITIALVALUES', initialValues);
	console.log('LOGGERDATA', loggerData);
	console.log('\n\n\n\n\n\n\n')


	async function fetchChosenTemplate(template_id, isDraft) {
		try {
			// get data from the templates only instead of calling the api
			console.log("Fetching chosen template --- Logged In :", loggerData?.isLoggedIn)
			if (templates.length > 0) {
				const match = templates.filter(item => (item._id === template_id))[0];
				if (match) {
					if (!isDraft) {
						sign_ref.current = match.data;
					}
					setChosenTemplateData(match);
					
					if (loggerData?.isLoggedIn) {
						if (isDraft) {
							setInitialValues(prev => ({ ...state?.chosen_draft_userData }))
							setUserData(prev => ({ ...state?.chosen_draft_userData}))
						} else {
							if(Object.values(loggerData?.userData)?.length > 0 && loggerData?.userData?.email && loggerData?.userData?.fullName && loggerData?.userData?.designation){
								setUserData({...loggerData?.userData});
								setInitialValues({...loggerData?.userData})
							} else {
								setInitialValues(prev => ({ ...prev, ...match.filler }))
							}
						}
					} else {
						// setUserData(prev => ({ ...prev, ...match.filler   }))
						setInitialValues(prev => ({ ...prev, ...match.filler }))
					}
				}
			} else {
				const template_data = await userServices.getTemplateById({ template_id: template_id });
				if (template_data) {
					if (!isDraft) {
						sign_ref.current = template_data?.data?.data?.data;
					}
					setChosenTemplateData(template_data?.data?.data)
					if (loggerData?.isLoggedIn) {
						if (isDraft) {
							setInitialValues(prev => ({ ...state?.chosen_draft_userData }))
							setUserData(prev => ({ ...state?.chosen_draft_userData}))
						} else {
							if(Object.values(loggerData?.userData)?.length > 0){
								if(!Object.values(userData)?.length > 0){
									setUserData({...loggerData?.userData});
									setInitialValues({...loggerData?.userData})
								}
							} else {
								setInitialValues(prev => ({ ...template_data?.data?.data?.filler }))
							}
						}
					} else {
						// setUserData(prev => ({ ...prev, ...match.filler   }))
						setInitialValues(prev => ({ ...prev, ...template_data?.data?.data?.filler }))
					}
				}
			}

		} catch (error) {
			console.log('Error in FetchChosenTemplate, ', error);
			enqueueSnackbar('Server Error! Failed to get templates!', {
				variant: 'customError',
			})
		}
	}

	async function handleImageUpload(data) {
		const myForm = new FormData();
		myForm.append('username', loggerData?.username || "");
		myForm.append('imageData', data);
		myForm.append('imageName', imageDetails?.name);
		myForm.append('imageMIME', imageDetails?.mime);
		try {
			const result = await userServices.uploadImage(myForm);
			if (result.status === 200 && result?.data?.success === true) {
				setUserData(prev => ({ ...prev, profileImage: result?.data?.image, visited:{...prev.visited, profile:true} }))
				setLoggerData(prev => ({ ...prev, userData: { ...prev.userData, profileImage: result?.data?.image, visited:{...prev.visited, profile:true} } }));
				setVisited(prev =>({...prev, profile:true}))
				// setTrigger(prev => !prev)
				setImage(null);
				setFile(null);
				setRenderTrigger(prev =>!prev)
			}
		} catch (error) {
			console.log('Some error occurred.', error);
			setVisited(prev =>({...prev, profile:false}));
			setUserData(prev => ({ ...prev, visited:{...prev.visited, profile:false} }))
			setLoggerData(prev => ({ ...prev, userData: { ...prev.userData,  visited:{...prev.visited, profile:false} } }));
			setImage(null);
			setFile(null);
			enqueueSnackbar('Failed to upload image', {
				variant: 'customError',
				anchorOrigin:{
					horizontal:'right',
					vertical:'top',
					autoHideDuration:2000
				}
			})
		}
	}

	async function handleLogoUpload(e) {
		const myForm = new FormData();
		myForm.append('username', loggerData?.username || "");
		myForm.append('banner', e.target.files[0]);
		try {
			const result = await userServices.uploadLogo(myForm);
			if (result.status === 200 && result?.data?.success === true) {
				setUserData(prev => ({ ...prev, banner: result?.data?.data }))
				setLoggerData(prev => ({ ...prev, userData: { ...prev.userData, banner: result?.data?.data } }))
				setVisited(prev =>({...prev, banner:true}))
			}
		} catch (error) {
			console.log('Some error occurred.', error);
			setVisited(prev =>({...prev, banner:false}))
			enqueueSnackbar('Failed to upload banner', {
				variant: 'customError',
				anchorOrigin:{
					horizontal:'right',
					vertical:'top',
					autoHideDuration:2000
				}
			})
		}
	}

	const replaceElementsWithDisplayNone = (node) => {
		if(node.attribs && node.attribs.id){
			if(node.attribs.id === 'profile-pic'){
				if(!userData?.visited?.profile){
					node.attribs.src = process.env.REACT_APP_BACKEND_URL + '/profile/dummy_avatar.png' ;
				}
			}
		}
		if (node.type === 'tag' && node.attribs && node.attribs.style) {
		  const styles = node.attribs.style.split(';').map(style => style.trim());
		  if (styles.includes('display: none') || styles.includes('display:none')) {
			return <></>; // Return null to remove the element
		  }
		}
		return node;
	};


	function copyTextPlain(e) {
		try {
			if (!loggerData?.isLoggedIn) {
				loginAndRedirect();
			} else {
				e.stopPropagation();
				userServices.addUserData(loggerData?.user_id, loggerData?.email, loggerData?.access_token, userData, chosenTemplateData?._id)
					.then(res => {});
				if (window.getSelection) {
					let range = document.createRange();
					const textArea = document.createElement('input');
					// before passing value remove display nones
					const node = parse(sign_ref.current.replace(/(\r\n|\n|\r)/gm, ""), {
						replace: replaceElementsWithDisplayNone
					  });
					const node_text = reactDOMServer.renderToString(node);
					textArea.value = node_text;
					document.body.appendChild(textArea);
					textArea.select();
					document.execCommand('copy')
					document.body.removeChild(textArea);
				}
			}
		} catch (error) {
			console.log(error)
			enqueueSnackbar('Oops! failed to copy signature', {variant:'customWarning'})
		}
	}


	const copyWithStyle = () => {
		try {
			if (!loggerData?.isLoggedIn) {
				loginAndRedirect();
			} else {
				console.log(userData)
				// before copying also save this to the users profile
				userServices.addUserData(loggerData?.user_id, loggerData?.email, loggerData?.access_token, userData, chosenTemplateData?._id)
					.then(res => {})
					.catch((err)=>{})
				userServices.saveToDrafts(loggerData?.user_id, loggerData?.email, loggerData?.access_token, chosenTemplateData._id, chosenTemplateData.cta_data, sign_ref.current, { ...userData })
					.then(res =>{})
					.catch((err) =>{})
				const temp = document.createElement("div");
				temp.setAttribute("contentEditable", true);
				const node = parse(sign_ref.current.replace(/(\r\n|\n|\r)/gm, ""), {
					replace: replaceElementsWithDisplayNone
				  });
				const node_text = reactDOMServer.renderToString(node);
				// pre and post codes added for outlook and other mails 
				temp.innerHTML = preCode + node_text + postCode;
				temp.style.position = 'fixed';
				temp.style.bottom = 0;
				temp.style.left = 0;
				temp.setAttribute("onfocus", "document.execCommand('selectAll',false,null)");
				document.body.appendChild(temp);
				temp.focus();
				document.execCommand("copy");
				document.body.removeChild(temp);
				document.getElementById('copy-btn').innerText = 'Copied'
			}
		} catch (error) {
			console.log(error)
			enqueueSnackbar('Oops! failed to copy signature', {variant:'customWarning'})
		}
	};

	function youtube_parser(url) {
		var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
		var match = url.match(regExp);
		var title = "";
		if(url !== ""){
			if(validator.isURL(url)){
				fetch(`https://noembed.com/embed?dataType=json&url=${url}`)
					.then(res => res.json())
					.then(data => {
						setUserData(prev => ({ ...prev, video: url, video_img: `https://i.ytimg.com/vi/${match && match[7].length === 11 ? match[7] : ''}/default.jpg`, video_title: data?.title }))
						setLoggerData(prev => ({ ...prev, userData: { ...prev.userData, video: url, video_img: `https://i.ytimg.com/vi/${match}/default.jpg`, video_title: title } }))
					})
			} else {
				setUserData(prev => ({ ...prev, video: url, video_img: '', video_title: '' }))
				setLoggerData(prev => ({ ...prev, userData: { ...prev.userData, video: url, video_img: '', video_title: '' } }))
			}
		} else {
			setUserData(prev => ({...prev, video:"", video_img:"", video_title:""}))
			setLoggerData(prev => ({...prev, userData:{...prev.userData, video:"", video_img:"", video_title:""}}))
		}

	}

	function handleLogin() {
		navigate('/login', { state: { draft_data: sign_ref.current, template_id: chosenTemplateData._id, cta_data: chosenTemplateData.cta_data, userData: userData, redirectToCreate: true } })
	}

	async function handleSave() {
		try {
			setSaving(true)
			const result = await userServices.saveToDrafts(loggerData?.user_id, loggerData?.email, loggerData?.access_token, chosenTemplateData._id, chosenTemplateData.cta_data, sign_ref.current, { ...userData });
			if (result.status === 201) {
				setSaving(false);
				enqueueSnackbar('Saved!', {
					variant: 'customSuccess',
				})
			}
		} catch (error) {
			console.log('Some error occurred.', error);
			setSaving(false)
			enqueueSnackbar('Failed to save template', {
				variant: 'customError',
			})
		}
	}

	function loginAndRedirect() {
		try {
			// store local storage 
			localStorage.setItem('userData', JSON.stringify(userData));
			localStorage.setItem('template_id', chosenTemplateData?._id);
			// login
			navigate('/login', { state: { redirectToCreate: true } });
			// come back
		} catch (error) {
			console.log(error);
			enqueueSnackbar('Login Error', {
				variant: 'customError',
				anchorOrigin:{
					horizontal:'right',
					vertical:'top',
					autoHideDuration:3000
				}
			})
		}

	}

	const handleGmailSignature = async () => {
		try {
			setLoading(true);
			if (!loggerData?.isLoggedIn) {
				loginAndRedirect();
			} else {
				userServices.addUserData(loggerData?.user_id, loggerData?.email, loggerData?.access_token, userData, chosenTemplateData?._id)
					.then(res => {})
					.catch((err)=>{ })

				userServices.saveToDrafts(loggerData?.user_id, loggerData?.email, loggerData?.access_token, chosenTemplateData._id, chosenTemplateData.cta_data, sign_ref.current, { ...userData })
				.then(res =>{})
				.catch((err) =>{})
				const node = parse(sign_ref.current.replace(/(\r\n|\n|\r)/gm, ""), {
					replace: replaceElementsWithDisplayNone
				});
				const node_text = reactDOMServer.renderToString(node);
				const result = await userServices.gmailAuth(node_text, loggerData?.email, chosenTemplateData?._id,);
				if (result?.status === 200) {
					// before redirect store all the state data and the chosen tempalte in the localstorage
					localStorage.setItem('userData', JSON.stringify(userData));
					localStorage.setItem('template_id', chosenTemplateData?._id);
					console.log('STORING DATA IN LOCAL STORAGE BEOFRE REDIRECT', userData, chosenTemplateData?._id);
					setLoading(false);
					window.location.href = result?.data?.authUrl
				}
			}
		} catch (error) {
			console.log('Some error occurred.', error);
			setLoading(false);
			enqueueSnackbar('Gmail Error', {
				variant: 'customError',
			})
		}
	}

	async function handleRefresh() {
		try {
			console.log('Handle Refresh Called...')
			if(loggerData?.isLoggedIn && Object.keys(loggerData?.userData)?.length > 0 && loggerData?.userData?.fullName && loggerData?.userData?.email && loggerData?.userData?.designation && loggerData?.template_id){
				console.log('***** SETTING USERDATA TO LOGGER DATA *****')
				setUserData(loggerData?.userData);
				setInitialValues(loggerData?.userData);
				fetchChosenTemplate(loggerData?.template_id, false);
			}
		} catch (error) {
			console.log('Silent Refresh --[FAILED]');
			console.log(error);
		}
	}


	function handleCtaDisplay(uuid){
		try {
			console.log(uuid)
			if(uuid.length > 0){
				document.getElementById('arrow-disclaimer').classList.remove('rotate');
				document.getElementById('arrow-quote').classList.remove('rotate');
				document.getElementById('arrow-applink').classList.remove('rotate');
				document.getElementById('arrow-video').classList.remove('rotate');
				document.getElementById('arrow-feedback').classList.remove('rotate');
				document.getElementById('arrow-banner').classList.remove('rotate');
				document.getElementById(`arrow-${uuid[0]?.toLowerCase()}`).classList.toggle('rotate');

				if(uuid[0] === "Disclaimer"){
				
					setCtaDisplay({
						disclaimer: true,
						quote: false,
						appLink: false,
						video: false,
						feedback: false,
						banner: false
					})
				} else if( uuid[0] === "Quote"){
					setCtaDisplay({
						disclaimer: false,
						quote: true,
						appLink: false,
						video: false,
						feedback: false,
						banner: false
					})
				} else if( uuid[0] === "AppLink"){
					setCtaDisplay({
						disclaimer: false,
						quote: false,
						appLink: true,
						video: false,
						feedback: false,
						banner: false
					})
				} else if( uuid[0] === "Video"){
					setCtaDisplay({
						disclaimer: false,
						quote: false,
						appLink: false,
						video: true,
						feedback: false,
						banner: false
					})
				} else if( uuid[0] === "Feedback"){
					setCtaDisplay({
						disclaimer: false,
						quote: false,
						appLink: false,
						video: false,
						feedback: true,
						banner: false
					})
				} else if( uuid[0] === "Banner"){
					setCtaDisplay({
						disclaimer: false,
						quote: false,
						appLink: false,
						video: false,
						feedback: false,
						banner: true
					})
				} else {
					console.log("unsetting all cta display")
					setCtaDisplay({
						disclaimer: false,
						quote: false,
						appLink: false,
						video: false,
						feedback: false,
						banner: false
					})
				}
			} else {
				setCtaDisplay({
					disclaimer: false,
					quote: false,
					appLink: false,
					video: false,
					feedback: false,
					banner: false
				})
			}
		} catch (error) {
			console.log(error)
		}
	} 

	function handleSwiper() {
		if(window.screen.width < 980) {
			setSwiperDisplay(true)
		} else {
			setSwiperDisplay(false)
		}
	}

	// useEffect(() => {
	// 	handleScrollTop()
	// })

	useEffect(() => {

		let urlparam = new URLSearchParams(window.location.search);
		let success = urlparam.get('success');
		if (success === 'true') {
			handleRefresh();
			enqueueSnackbar('Gmail Success', {
				variant: 'customSuccess',
			})
		}
		else if (success === 'false') {
			handleRefresh();
			enqueueSnackbar('Failed to add to Gmail', {
				variant: 'customError',
			})
		} else {
			handleRefresh();
		}
	}, [window.location.pathname]);

	useEffect(() => {
		if (state?.chosen_draft_data) {
			sign_ref.current = state?.chosen_draft_data;
			setUserData(prev => ({ ...state?.chosen_draft_userData }))
			setLoggerData(prev => ({ ...prev, userData: state?.chosen_draft_userData }))
		}
		fetchTemplates();
		fetchCategories();
	}, [0])

	useEffect(() => {
		handleTabber();
		document.getElementById('copy-btn').innerText = 'Copy Signature'
	}, [tabber])

	useEffect(() => {
		if (state?.chosen_draft_data) {
			sign_ref.current = state.chosen_draft_data;
			fetchChosenTemplate(state.chosen_draft_template_id, true);
		} else {
			console.log('Inside Effect, template_id', loggerData);
			console.log('Chosen Template Data in it ->', chosenTemplateData)
			const urlParam = new URLSearchParams(window.location.search);
			let template_id = urlParam.get('template_id');
			if(template_id && template_id !== ""){
				fetchChosenTemplate(template_id, false);
			}
			else if(loggerData?.template_id){
				const urlParam = new URLSearchParams(window.location.search);
				urlParam.set('template_id', loggerData?.template_id);
				fetchChosenTemplate(loggerData?.template_id, false);
			}
		}
	}, [trigger])

	useEffect(() => {
		window.addEventListener('resize', handleSwiper);
		handleSwiper();
		return () => {
			window.removeEventListener('resize', handleSwiper);
		};
	}, []);
	useEffect(()=>{
		if(state?.tabber){
			setTabber(state?.tabber)
		}
	},[])
	useEffect(()=>{
		setUserData({...loggerData?.userData})
	},[loggerData?.userData?.fullName])

	async function resetInitialValues() {
		try {
			if(!loggerData?.isLoggedIn){
				console.log('USER HAS LOGGED OUT, REMOVING USER DATA');
				setUserData({})
				setLoggerData(prev => ({...prev, userData:{}}));
				const template_id = chosenTemplateData?._id;
				if(template_id){
					if (templates.length > 0) {
						const match = templates.filter(item => (item._id === template_id))[0];
						if (match) {
							setInitialValues({...match?.filler})
						}
					} else {
						const template_data = await userServices.getTemplateById({ template_id: template_id });
						if (template_data) {
							setInitialValues({...template_data?.data?.data?.filler})
						}
					}
				}
			}
		} catch (error) {
			console.log(error)
		}
	}

	useEffect(()=>{
		resetInitialValues();
		if(loggerData?.template_id){
			fetchChosenTemplate(loggerData?.template_id, false);
		}
	},[loggerData?.isLoggedIn])

	// useEffect(()=>{
	// 	if(Object.keys(userData)?.length > 0){
	// 		localStorage.setItem('userData', JSON.stringify(userData));
	// 	}
	// 	if(chosenTemplateData?._id){
	// 		localStorage.setItem('template_id', JSON.stringify(chosenTemplateData?._id))
	// 	}
	// },[
	// 	userData?.fullName,
	// 	userData?.logoName,
	// 	userData?.designation,
	// 	userData?.phone,
	// 	userData?.location,
	// 	userData?.email,
	// 	userData?.website,
	// 	userData?.profileImage,
	// 	userData?.logoImage,
	// 	userData?.facebook,
	// 	userData?.instagram,
	// 	userData?.youtube,
	// 	userData?.twitter,
	// 	userData?.linkedIn,
	// 	userData?.pinterest,
	// 	userData?.skype,
	// 	userData?.whatsapp,
	// 	userData?.disclaimer,
	// 	userData?.video,
	// 	userData?.quote,
	// 	userData?.playStoreAppLink,
	// 	userData?.appleStoreAppLink,
	// 	userData?.feedback,
	// 	userData?.visited?.profile,
	// 	userData?.visited?.details,
	// 	userData?.visited?.social,
	// 	userData?.visited?.cta,
	//  	chosenTemplateData?._id
	// ])

	useEffect(()=>{
		
		if(userData?.facebook){
			setSocialChecker(prev =>({...prev, facebook:true}))
		}
		if(userData?.linkedIn){
			setSocialChecker(prev =>({...prev, linkedin:true}))
		}
		if(userData?.instagram){
			setSocialChecker(prev =>({...prev, instagram:true}))
		}
		if(userData?.twitter){
			setSocialChecker(prev =>({...prev, twitter:true}))
		}
		if(userData?.skype){
			setSocialChecker(prev =>({...prev, skype:true}))
		}
		if(userData?.youtube){
			setSocialChecker(prev =>({...prev, youtube:true}))
		}
		if(userData?.whatsapp){
			setSocialChecker(prev =>({...prev, whatsapp:true}))
		}
		if(userData?.pinterest){
			setSocialChecker(prev =>({...prev, pinterest:true}))
		}
		
	},[userData?.facebook,userData?.linkedIn, userData?.instagram, userData?.twitter,userData?.skype, userData?.youtube,userData?.whatsapp,userData?.pinterest ])

	useEffect(()=>{

		if(loggerData?.isLoggedIn && Object.keys(loggerData?.userData)?.length > 0 && loggerData?.template_id){
			if(userData?.facebook === "" || !userData?.facebook){
				setSocialChecker(prev =>({...prev, facebook:false}))
			}
			if(userData?.linkedIn === "" || !userData?.linkedIn){
				setSocialChecker(prev =>({...prev, linkedin:false}))
			}
			if(userData?.instagram === "" || !userData?.instagram){
				setSocialChecker(prev =>({...prev, instagram:false}))
			}
			if(userData?.twitter === "" || !userData?.twitter){
				setSocialChecker(prev =>({...prev, twitter:false}))
			}
			if(userData?.skype === "" || !userData?.skype){
				setSocialChecker(prev =>({...prev, skype:false}))
			}
			if(userData?.youtube === "" || !userData?.youtube){
				setSocialChecker(prev =>({...prev, youtube:false}))
			}
			if(userData?.whatsapp === "" || !userData?.whatsapp){
				setSocialChecker(prev =>({...prev, whatsapp:false}))
			}
			if(userData?.pinterest === "" || !userData?.pinterest){
				setSocialChecker(prev =>({...prev, pinterest:false}))
			}
		} else {
			if(userData?.facebook === "" ){
				setSocialChecker(prev =>({...prev, facebook:false}))
			}
			if(userData?.linkedIn === ""){
				setSocialChecker(prev =>({...prev, linkedin:false}))
			}
			if(userData?.instagram === ""){
				setSocialChecker(prev =>({...prev, instagram:false}))
			}
			if(userData?.twitter === ""){
				setSocialChecker(prev =>({...prev, twitter:false}))
			}
			if(userData?.skype === ""){
				setSocialChecker(prev =>({...prev, skype:false}))
			}
			if(userData?.youtube === ""){
				setSocialChecker(prev =>({...prev, youtube:false}))
			}
			if(userData?.whatsapp === ""){
				setSocialChecker(prev =>({...prev, whatsapp:false}))
			}
			if(userData?.pinterest === ""){
				setSocialChecker(prev =>({...prev, pinterest:false}))
			}
		}                                       
	},[userData?.facebook,userData?.linkedIn, userData?.instagram, userData?.twitter,userData?.skype, userData?.youtube,userData?.whatsapp,userData?.pinterest ])


	return (
		<ErrorBoundary FallbackComponent={<FallBack />}>
			<>
				<FullScreenLoader loading={loading} />
				<Meta
					title="Create | Email Signatures"
					desc=""
					keywords=""
				/>
				<Header source={'create'} userData={userData} template_id={chosenTemplateData?._id} />
				<section className="create-template-wr">
					<div className="center-wr">
						<div className="create-template-content clearfix">
							<div className="create-template-left">
								<div className="create-template-box create-box-blk" style={{backgroundColor:tabber === "filter-template"&&"#6440FB"}} data-filter="filter-template" onClick={(e) => { validateTabberChange('filter-template', true) }}>
									<div className="create-template-box-count" style={{backgroundColor:Object.values(chosenTemplateData)?.length > 0 && '#71dd37'}}>{Object.values(chosenTemplateData)?.length > 0 ? <img src='assets/images/tick-svgrepo-com.svg' alt="" width={24} height={24} /> : '1' }</div>
									<div className="create-template-box-inner">
										<div className="create-box-icon">
											<svg width="26" height="22" viewBox="0 0 26 22" fill="none" xmlns="http://www.w3.org/2000/svg">
												<path d="M25.999 4.01998V4.84998C25.923 4.87698 25.952 4.94498 25.946 4.99498C25.7307 6.88498 25.5164 8.77532 25.303 10.666C25.078 12.653 24.845 14.639 24.63 16.628C24.6307 17.1653 24.4535 17.6877 24.1261 18.1137C23.7987 18.5398 23.3394 18.8454 22.82 18.983C22.6 19.043 22.538 19.125 22.55 19.341C22.5739 19.6413 22.5363 19.9433 22.4395 20.2285C22.3427 20.5138 22.1888 20.7763 21.987 21C21.7182 21.3004 21.3856 21.5371 21.0137 21.6928C20.6418 21.8485 20.2398 21.9193 19.837 21.9C17.4284 21.8953 15.02 21.8953 12.612 21.9C9.5527 21.9 6.49337 21.9 3.43404 21.9C2.86877 21.9203 2.31472 21.7388 1.87104 21.388C1.58137 21.151 1.35152 20.8492 1.20004 20.507C1.04856 20.1648 0.979702 19.7917 0.999036 19.418C1.0037 16.5513 1.0037 13.687 0.999036 10.825C0.999036 9.62498 0.999036 8.41698 0.999036 7.21198C0.972709 6.65077 1.13423 6.0968 1.45806 5.63768C1.78189 5.17857 2.24953 4.84051 2.78704 4.67698C3.2106 4.59575 3.64333 4.57321 4.07304 4.60998C4.24104 4.60998 4.29404 4.55798 4.31104 4.39998C4.39004 3.68098 4.48804 2.96398 4.56404 2.24498C4.6073 1.7144 4.82171 1.21222 5.17501 0.814017C5.52831 0.415811 6.00138 0.143122 6.52304 0.0369838C6.95177 -0.0149601 7.38598 0.00022205 7.81004 0.0819838C9.59904 0.283984 11.399 0.492984 13.189 0.699984C14.837 0.887317 16.485 1.07265 18.133 1.25598C19.959 1.46198 21.783 1.67798 23.61 1.87498C24.029 1.90013 24.4356 2.02712 24.7944 2.24495C25.1532 2.46277 25.4534 2.76485 25.669 3.12498C25.8093 3.41309 25.9202 3.71462 26 4.02498M2.21904 15.771L2.39304 15.646C3.6357 14.7433 4.87837 13.8407 6.12104 12.938C6.63829 12.5183 7.29174 12.3033 7.95714 12.3339C8.62254 12.3645 9.2535 12.6386 9.73004 13.104C10.7614 14.0127 11.7927 14.9213 12.824 15.83C13.0803 16.0915 13.4206 16.2544 13.7851 16.2901C14.1495 16.3257 14.5149 16.2319 14.817 16.025C16.9357 14.793 19.0537 13.5597 21.171 12.325C21.2279 12.2995 21.2754 12.2569 21.3069 12.2031C21.3385 12.1493 21.3525 12.0871 21.347 12.025C21.341 10.447 21.347 8.86898 21.347 7.28998C21.35 7.12746 21.3274 6.96549 21.28 6.80998C21.1892 6.50748 20.9979 6.24501 20.7377 6.06593C20.4775 5.88684 20.164 5.80185 19.849 5.82498H3.49904C3.43404 5.82498 3.36904 5.82498 3.29904 5.82498C3.04389 5.83348 2.80211 5.9411 2.62504 6.12498C2.48398 6.27157 2.37481 6.44579 2.30442 6.63666C2.23402 6.82753 2.20393 7.03091 2.21604 7.23398C2.21604 9.92665 2.21604 12.6193 2.21604 15.312V15.773M21.344 13.7C21.2487 13.7019 21.157 13.7373 21.085 13.8C19.2184 14.8793 17.3517 15.9603 15.485 17.043C15.0854 17.2946 14.6322 17.4488 14.162 17.493C13.7637 17.5199 13.364 17.4648 12.9878 17.331C12.6116 17.1972 12.2669 16.9875 11.975 16.715C10.934 15.8 9.89904 14.884 8.85804 13.975C8.59745 13.7044 8.24253 13.5448 7.86718 13.5293C7.49184 13.5138 7.125 13.6437 6.84304 13.892C5.3557 14.9827 3.86904 16.0746 2.38304 17.168C2.3287 17.2002 2.28423 17.2467 2.25444 17.3024C2.22465 17.3581 2.21067 17.4209 2.21404 17.484C2.22304 18.167 2.21404 18.85 2.21404 19.534C2.20949 19.656 2.22297 19.7779 2.25404 19.896C2.3306 20.1564 2.49834 20.3805 2.72658 20.5274C2.95482 20.6743 3.22831 20.7341 3.49704 20.696H19.827C19.916 20.696 20.006 20.696 20.095 20.684C20.2685 20.6851 20.4404 20.6499 20.5995 20.5808C20.7587 20.5117 20.9016 20.4101 21.0193 20.2825C21.1369 20.155 21.2267 20.0043 21.2828 19.8401C21.3389 19.6759 21.3601 19.5018 21.345 19.329C21.345 17.529 21.345 15.7313 21.345 13.936L21.344 13.7ZM12.889 4.60498C15.2157 4.60498 17.5424 4.60498 19.869 4.60498C20.2267 4.59913 20.5818 4.66591 20.9129 4.80129C21.244 4.93666 21.5442 5.13781 21.7953 5.39256C22.0464 5.64731 22.2432 5.95037 22.3738 6.28338C22.5044 6.6164 22.566 6.97245 22.555 7.32998C22.555 10.7227 22.555 14.115 22.555 17.507C22.555 17.564 22.555 17.621 22.555 17.678C22.549 17.783 22.579 17.804 22.68 17.757C22.8482 17.6929 22.9961 17.5849 23.1083 17.4442C23.2206 17.3034 23.293 17.1352 23.318 16.957C23.438 16.006 23.545 15.057 23.655 14.1C23.825 12.6333 23.9944 11.164 24.163 9.69198C24.363 7.95598 24.573 6.22098 24.769 4.48498C24.7924 4.32913 24.7842 4.17017 24.7451 4.01752C24.7059 3.86486 24.6366 3.7216 24.5411 3.59621C24.4456 3.47082 24.326 3.36584 24.1893 3.28748C24.0525 3.20912 23.9015 3.15897 23.745 3.13998C22.764 2.99998 21.777 2.89998 20.792 2.78698C18.6127 2.53232 16.433 2.27832 14.253 2.02498C11.928 1.75598 9.60204 1.49398 7.27704 1.22498C7.09105 1.18413 6.89825 1.18569 6.71295 1.22955C6.52765 1.27341 6.3546 1.35844 6.20666 1.47833C6.05872 1.59822 5.93968 1.74989 5.85838 1.92208C5.77708 2.09428 5.73561 2.28257 5.73704 2.47298C5.67604 3.10398 5.61004 3.73498 5.51804 4.36198C5.48604 4.57998 5.53404 4.61098 5.73804 4.61098C8.12204 4.60398 10.505 4.61098 12.889 4.61098" fill="#A996DB" />
												<path d="M13.66 12.828C13.1555 12.8282 12.6622 12.6786 12.2427 12.3982C11.8232 12.1179 11.4963 11.7193 11.3035 11.253C11.1107 10.7868 11.0606 10.2738 11.1596 9.77899C11.2585 9.28422 11.5021 8.82996 11.8595 8.47373C12.2168 8.11751 12.6718 7.87536 13.1669 7.77794C13.662 7.68052 14.1748 7.73223 14.6405 7.92651C15.1062 8.12079 15.5037 8.44889 15.7828 8.86928C16.0618 9.28966 16.2098 9.78341 16.208 10.288C16.2012 10.9609 15.9303 11.6042 15.4537 12.0793C14.9771 12.5544 14.333 12.8233 13.66 12.828ZM12.329 10.275C12.3271 10.5393 12.4036 10.7982 12.5489 11.019C12.6942 11.2397 12.9017 11.4124 13.1453 11.5151C13.3888 11.6178 13.6573 11.6459 13.9168 11.5958C14.1763 11.5458 14.4151 11.4198 14.603 11.2339C14.7909 11.048 14.9193 10.8105 14.9721 10.5516C15.0249 10.2926 14.9996 10.0238 14.8995 9.7792C14.7993 9.53461 14.6289 9.32524 14.4096 9.17762C14.1904 9.03 13.9323 8.95078 13.668 8.94998C13.3153 8.94996 12.9768 9.08911 12.7261 9.3372C12.4754 9.58529 12.3327 9.92229 12.329 10.275Z" fill="#A996DB" />
											</svg>
										</div>
										<div className="create-box-text">
											<h4>Template</h4>
										</div>
									</div>
								</div>
								<div className="create-details-box create-box-blk" style={{backgroundColor:tabber === "filter-details"&&"#6440FB"}} data-filter="filter-details" onClick={(e) => { validateTabberChange('filter-details', true) }}>
								<div className="create-details-box-count"  
								style={{
									backgroundColor: ((userData?.fullName && userData?.email && isEmail(userData?.email) && userData?.designation) ) && '#71dd37'}}>
										{((userData?.fullName && userData?.email && isEmail(userData?.email) && userData?.designation)) ? <img src='assets/images/tick-svgrepo-com.svg' alt="" width={24} height={24} /> : '2' }
								</div>
									<div className="create-template-box-inner">
										<div className="create-box-icon">
											<svg width="27" height="28" viewBox="0 0 27 28" fill="none" xmlns="http://www.w3.org/2000/svg">
												<path d="M21.056 0C21.164 0.094 21.311 0.079 21.433 0.138C21.7081 0.251694 21.9434 0.444258 22.1092 0.691434C22.2751 0.938609 22.3641 1.22934 22.365 1.527C22.385 3.444 22.376 5.361 22.373 7.279C22.3776 7.3519 22.3673 7.42497 22.3426 7.49372C22.318 7.56247 22.2795 7.62544 22.2295 7.67875C22.1796 7.73206 22.1193 7.77458 22.0523 7.80368C21.9853 7.83279 21.913 7.84787 21.84 7.848C21.7648 7.84467 21.6912 7.82588 21.6236 7.79278C21.556 7.75969 21.496 7.71301 21.4473 7.65566C21.3986 7.59831 21.3622 7.53153 21.3405 7.4595C21.3188 7.38746 21.3121 7.31172 21.321 7.237C21.321 5.557 21.321 3.87733 21.321 2.198C21.321 2.013 21.321 1.828 21.321 1.644C21.3274 1.56411 21.3162 1.4838 21.2881 1.40873C21.2601 1.33366 21.2159 1.26567 21.1586 1.20958C21.1014 1.15348 21.0325 1.11065 20.9569 1.08411C20.8813 1.05758 20.8007 1.04798 20.721 1.056C20.66 1.056 20.598 1.056 20.536 1.056H1.831C1.204 1.056 1.055 1.205 1.055 1.836C1.055 9.61933 1.055 17.4027 1.055 25.186C1.055 25.816 1.204 25.965 1.831 25.965H20.564C21.164 25.965 21.319 25.807 21.32 25.218C21.32 24.031 21.32 22.843 21.32 21.656C21.32 21.214 21.601 20.956 21.973 21.051C22.0913 21.0749 22.197 21.1408 22.2706 21.2366C22.3441 21.3324 22.3805 21.4515 22.373 21.572C22.373 22.891 22.393 24.211 22.363 25.529C22.349 25.9116 22.1931 26.2754 21.9256 26.5494C21.6581 26.8233 21.2982 26.9879 20.916 27.011C20.794 27.023 20.67 27.02 20.547 27.02C14.3203 27.02 8.094 27.0217 1.868 27.025C1.47602 27.0743 1.07922 26.9835 0.747793 26.7684C0.416367 26.5534 0.171674 26.2281 0.057 25.85C0.051 25.831 0.02 25.82 0 25.806V1.214C0.147 1.062 0.166 0.844 0.286 0.675C0.539584 0.358509 0.880787 0.123737 1.267 0L21.056 0Z" fill="#A996DB" />
												<path d="M24.389 6.59099C26.455 6.59999 27.614 8.39698 26.663 10.015C25.334 12.275 24.038 14.554 22.728 16.825C21.8907 18.2757 21.0537 19.7263 20.217 21.177C20.0973 21.3914 19.9325 21.5773 19.734 21.722C18.712 22.467 17.696 23.222 16.678 23.97C16.6084 24.0372 16.5254 24.0891 16.4345 24.1222C16.3435 24.1552 16.2466 24.1688 16.15 24.162C16.08 24.1512 16.0129 24.1262 15.9529 24.0885C15.8929 24.0509 15.8412 24.0014 15.8009 23.9431C15.7607 23.8848 15.7327 23.8188 15.7188 23.7494C15.7049 23.6799 15.7053 23.6083 15.72 23.539C15.791 22.796 15.878 22.054 15.959 21.312C16.021 20.753 16.09 20.195 16.145 19.636C16.1655 19.4172 16.2337 19.2055 16.345 19.016C18.4997 15.288 20.652 11.559 22.802 7.82899C22.9493 7.51059 23.1704 7.232 23.4472 7.01646C23.7239 6.80093 24.0483 6.65472 24.393 6.59M24.748 11.218C24.731 11.151 24.658 11.131 24.603 11.1C24.042 10.774 23.475 10.459 22.92 10.123C22.768 10.031 22.72 10.081 22.649 10.206C20.9424 13.1687 19.2324 16.13 17.519 19.09C17.436 19.233 17.456 19.29 17.593 19.365C18.151 19.678 18.708 19.994 19.256 20.325C19.414 20.425 19.467 20.374 19.547 20.235C21.2484 17.279 22.9524 14.3247 24.659 11.372L24.749 11.22M24.675 7.644C24.5068 7.65642 24.344 7.70938 24.2007 7.79837C24.0574 7.88736 23.9378 8.0097 23.852 8.15498C23.676 8.42598 23.524 8.713 23.352 8.989C23.297 9.079 23.29 9.129 23.397 9.189C23.991 9.525 24.581 9.86799 25.17 10.212C25.256 10.262 25.307 10.258 25.357 10.165C25.524 9.85799 25.721 9.56499 25.862 9.24599C25.9369 9.06031 25.9628 8.85851 25.9372 8.65994C25.9117 8.46137 25.8355 8.27271 25.716 8.11206C25.5966 7.95141 25.4377 7.82417 25.2549 7.74255C25.0721 7.66094 24.8714 7.62769 24.672 7.646M18.659 21.198L17.134 20.319L16.889 22.501L18.659 21.201" fill="#A996DB" />
												<path d="M6.33301 7.70599C6.33281 6.74631 6.61703 5.80811 7.14977 5.00988C7.6825 4.21166 8.43985 3.58922 9.32616 3.22119C10.2125 2.85317 11.188 2.75607 12.1294 2.94216C13.0709 3.12824 13.9361 3.58917 14.6157 4.26671C15.2953 4.94425 15.7589 5.80802 15.9479 6.7489C16.1369 7.68978 16.0428 8.66557 15.6775 9.553C15.3122 10.4404 14.6921 11.1997 13.8956 11.7349C13.099 12.2701 12.1617 12.5572 11.202 12.56C9.91349 12.5592 8.67777 12.048 7.76526 11.1383C6.85275 10.2286 6.33777 8.99448 6.33301 7.70599ZM14.233 9.94299C14.6439 9.3858 14.8941 8.72665 14.9566 8.03719C15.0191 7.34772 14.8913 6.65433 14.5873 6.03237C14.2833 5.41042 13.8146 4.8837 13.2321 4.50948C12.6497 4.13525 11.9758 3.92784 11.2838 3.90978C10.5917 3.89173 9.90798 4.06372 9.30684 4.40706C8.70569 4.7504 8.21016 5.25196 7.87412 5.85722C7.53807 6.46247 7.37436 7.14826 7.40079 7.84004C7.42721 8.53183 7.64276 9.20313 8.024 9.78099C8.074 9.85699 8.107 10.008 8.233 9.83399C8.5734 9.36172 9.02601 8.98163 9.55 8.72799C9.65 8.67999 9.68901 8.64399 9.61301 8.53599C9.33312 8.09376 9.22166 7.5656 9.299 7.04799C9.324 6.6596 9.46768 6.28825 9.7106 5.98416C9.95352 5.68008 10.2839 5.45793 10.6572 5.34776C11.0305 5.23758 11.4286 5.2447 11.7977 5.36815C12.1668 5.4916 12.4891 5.72542 12.721 6.03799C12.9537 6.4008 13.0844 6.81958 13.0993 7.25033C13.1143 7.68108 13.013 8.10791 12.806 8.48599C12.756 8.56799 12.647 8.64199 12.822 8.72499C13.3912 9.00035 13.8779 9.42079 14.233 9.94399M11.182 11.509C11.9589 11.4976 12.7153 11.2579 13.357 10.82C13.47 10.743 13.457 10.694 13.398 10.594C13.156 10.2291 12.8274 9.92994 12.4415 9.72312C12.0556 9.51631 11.6245 9.40832 11.1867 9.40882C10.7488 9.40931 10.318 9.51827 9.93256 9.72596C9.54714 9.93365 9.21918 10.2336 8.978 10.599C8.914 10.707 8.925 10.751 9.03 10.822C9.66516 11.2556 10.4131 11.4944 11.182 11.509ZM12.041 7.32799H12.025C12.025 7.25799 12.025 7.18699 12.025 7.11699C12.017 6.91809 11.9381 6.72862 11.8025 6.58282C11.667 6.43702 11.4838 6.3445 11.286 6.32199C11.084 6.29159 10.8779 6.33856 10.709 6.4535C10.5401 6.56845 10.4208 6.7429 10.375 6.94199C10.3082 7.19797 10.3102 7.46707 10.381 7.72199C10.4281 7.90187 10.5347 8.06054 10.6833 8.17219C10.832 8.28384 11.0141 8.34192 11.2 8.33699C11.3901 8.33242 11.5732 8.26392 11.7196 8.14253C11.866 8.02115 11.9673 7.85398 12.007 7.66799C12.0237 7.5554 12.0327 7.4418 12.034 7.32799" fill="#A996DB" />
												<path d="M10.304 14.249H13.809C13.879 14.249 13.95 14.249 14.02 14.249C14.089 14.2482 14.1576 14.2609 14.2218 14.2866C14.2859 14.3122 14.3444 14.3502 14.3938 14.3985C14.4433 14.4467 14.4827 14.5042 14.5099 14.5677C14.5372 14.6312 14.5516 14.6994 14.5525 14.7685C14.5533 14.8376 14.5406 14.9062 14.5149 14.9703C14.4893 15.0344 14.4512 15.0929 14.403 15.1424C14.3548 15.1918 14.2973 15.2313 14.2338 15.2585C14.1703 15.2857 14.102 15.3002 14.033 15.301C13.972 15.306 13.91 15.301 13.849 15.301H6.73297C6.68897 15.301 6.64498 15.301 6.60098 15.301C6.52698 15.308 6.45235 15.2992 6.38194 15.2755C6.31153 15.2517 6.24691 15.2133 6.19227 15.163C6.13763 15.1126 6.0942 15.0513 6.0648 14.983C6.03539 14.9148 6.02067 14.8411 6.02159 14.7668C6.0225 14.6925 6.03903 14.6192 6.07011 14.5517C6.10119 14.4842 6.14613 14.424 6.20199 14.3749C6.25785 14.3259 6.3234 14.2892 6.39437 14.2671C6.46535 14.2451 6.54018 14.2383 6.61398 14.247C6.85998 14.242 7.10597 14.247 7.35197 14.247H10.304" fill="#A996DB" />
												<path d="M10.287 17.204H13.871C13.9851 17.1959 14.0997 17.2091 14.209 17.243C14.3109 17.2786 14.3992 17.3452 14.4614 17.4334C14.5236 17.5217 14.5567 17.6271 14.556 17.7351C14.5554 17.843 14.521 17.9481 14.4577 18.0356C14.3944 18.1231 14.3054 18.1886 14.203 18.223C14.0935 18.2558 13.979 18.2683 13.865 18.26C11.4843 18.26 9.10367 18.26 6.723 18.26C6.61787 18.2632 6.51276 18.2535 6.41001 18.231C6.29624 18.2052 6.19468 18.1413 6.12216 18.05C6.04963 17.9586 6.01048 17.8452 6.01118 17.7285C6.01188 17.6119 6.05238 17.499 6.126 17.4085C6.19962 17.318 6.30194 17.2554 6.41601 17.231C6.51891 17.2097 6.62398 17.2006 6.72901 17.204C7.91501 17.204 9.10101 17.204 10.287 17.204Z" fill="#A996DB" />
												<path d="M10.283 21.215C9.07098 21.215 7.85797 21.215 6.64597 21.215C6.18697 21.215 5.91198 20.881 6.05698 20.509C6.10234 20.3934 6.18504 20.2963 6.29194 20.233C6.39884 20.1698 6.5238 20.1441 6.64698 20.16C7.30598 20.16 7.96499 20.16 8.62399 20.16H13.816C13.8949 20.156 13.974 20.156 14.053 20.16C14.186 20.1671 14.3118 20.2232 14.4058 20.3176C14.4998 20.412 14.5555 20.5379 14.562 20.671C14.5641 20.8092 14.5119 20.9426 14.4164 21.0425C14.321 21.1425 14.1901 21.2008 14.052 21.205C13.763 21.222 13.473 21.211 13.183 21.211H10.283" fill="#A996DB" />
												<path d="M12.584 24.17C12.154 24.17 11.724 24.17 11.294 24.17C10.912 24.17 10.666 23.961 10.662 23.648C10.658 23.335 10.906 23.118 11.284 23.116C12.17 23.116 13.056 23.116 13.942 23.116C14.318 23.116 14.566 23.337 14.56 23.651C14.5566 23.7259 14.5379 23.7993 14.505 23.8666C14.4721 23.934 14.4257 23.9939 14.3687 24.0425C14.3117 24.0912 14.2453 24.1276 14.1736 24.1495C14.1019 24.1715 14.0265 24.1784 13.952 24.17C13.496 24.17 13.04 24.17 12.583 24.17" fill="#A996DB" />
												<path d="M4.29197 15.302C4.15273 15.3041 4.01835 15.2509 3.9184 15.1539C3.81844 15.0569 3.76109 14.9242 3.75897 14.785C3.75685 14.6458 3.81013 14.5114 3.90708 14.4114C4.00404 14.3115 4.13673 14.2541 4.27597 14.252C4.34491 14.251 4.4134 14.2635 4.47749 14.2889C4.54159 14.3143 4.60005 14.3521 4.64954 14.4001C4.69904 14.4481 4.73859 14.5054 4.76595 14.5687C4.7933 14.632 4.80792 14.7001 4.80898 14.769C4.81003 14.838 4.79748 14.9064 4.77207 14.9705C4.74666 15.0346 4.70887 15.0931 4.66086 15.1426C4.61285 15.1921 4.55557 15.2316 4.49227 15.259C4.42898 15.2863 4.36091 15.301 4.29197 15.302Z" fill="#A996DB" />
												<path d="M4.29601 17.206C4.43525 17.2093 4.56747 17.2678 4.66358 17.3686C4.75969 17.4694 4.81183 17.6043 4.80851 17.7436C4.8052 17.8828 4.7467 18.015 4.6459 18.1111C4.5451 18.2072 4.41025 18.2593 4.27101 18.256C4.20206 18.2544 4.13412 18.2392 4.07106 18.2113C4.00799 18.1834 3.95103 18.1433 3.90344 18.0934C3.80733 17.9926 3.7552 17.8578 3.75851 17.7185C3.76183 17.5793 3.82032 17.4471 3.92112 17.351C4.02192 17.2549 4.15677 17.2027 4.29601 17.206Z" fill="#A996DB" />
												<path d="M4.29397 20.161C4.43321 20.1638 4.56564 20.2218 4.66212 20.3222C4.75861 20.4226 4.81125 20.5572 4.80847 20.6965C4.80569 20.8357 4.7477 20.9681 4.64728 21.0646C4.54685 21.1611 4.41221 21.2138 4.27297 21.211C4.20403 21.2096 4.13603 21.1946 4.07286 21.167C4.00969 21.1393 3.95259 21.0995 3.90481 21.0498C3.85704 21.0001 3.81953 20.9414 3.79442 20.8772C3.76931 20.813 3.75709 20.7444 3.75847 20.6755C3.75985 20.6065 3.77479 20.5386 3.80245 20.4754C3.83011 20.4122 3.86993 20.3551 3.91966 20.3073C3.96939 20.2595 4.02804 20.2221 4.09226 20.1969C4.15648 20.1718 4.22502 20.1596 4.29397 20.161Z" fill="#A996DB" />
											</svg>
										</div>
										<div className="create-box-text">
											<h4>Details</h4>
										</div>
									</div>
								</div>
								<div className="create-social-box create-box-blk" style={{backgroundColor:tabber === "filter-social"&&"#6440FB"}} data-filter="filter-social" onClick={(e) => { validateTabberChange('filter-social',true) }}>
									<div className="create-social-box-count" 
										style={{
											backgroundColor: ((FACEBOOK_REGEXP.test(userData?.facebook) && userData?.facebook !== initialValues?.facebook) ||
											(INSTA_REGEXP.test(userData?.instagram) && userData?.instagram !== initialValues?.instagram) ||
											(TWITTER_REGEXP.test(userData?.twitter) && userData?.twitter !== initialValues?.twitter) ||
											(LINKEDIN_REGEXP.test(userData?.linkedIn) && userData?.linkedIn !== initialValues?.linkedIn) ||
											(YOUTUBE_REGEXP.test(userData?.youtube) && userData?.youtube !== initialValues?.youtube) ||
											(SKYPE_REGEXP.test(userData?.skype) && userData?.skype !== initialValues?.skype) ||
											(WHATSAPP_REGEXP.test(userData?.whatsapp) && userData?.whatsapp !== initialValues?.whatsapp) ||
											(PINTEREST_REGEXP.test(userData?.pinterest) && userData?.pinterest !== initialValues?.pinterest) || visited?.social || userData?.visited?.social
											) && '#71dd37'}}
									>

											{  ((FACEBOOK_REGEXP.test(userData?.facebook) && userData?.facebook !== initialValues?.facebook) ||
											(INSTA_REGEXP.test(userData?.instagram) && userData?.instagram !== initialValues?.instagram) ||
											(TWITTER_REGEXP.test(userData?.twitter) && userData?.twitter !== initialValues?.twitter) ||
											(LINKEDIN_REGEXP.test(userData?.linkedIn) && userData?.linkedIn !== initialValues?.linkedIn) ||
											(YOUTUBE_REGEXP.test(userData?.youtube) && userData?.youtube !== initialValues?.youtube) ||
											(SKYPE_REGEXP.test(userData?.skype) && userData?.skype !== initialValues?.skype) ||
											(WHATSAPP_REGEXP.test(userData?.whatsapp) && userData?.whatsapp !== initialValues?.whatsapp) ||
											(PINTEREST_REGEXP.test(userData?.pinterest) && userData?.pinterest !== initialValues?.pinterest) || visited?.social || userData?.visited?.social
											) ? <img src='assets/images/tick-svgrepo-com.svg' alt="" width={24} height={24} /> : '3' }
									</div>
									<div className="create-template-box-inner">
										<div className="create-box-icon">
											<svg width="30" height="29" viewBox="0 0 30 29" fill="none" xmlns="http://www.w3.org/2000/svg">
												<path d="M27.2299 -0.000976562C27.5661 0.0925815 27.8871 0.234031 28.1829 0.419023C28.4699 0.625624 28.7025 0.898626 28.861 1.2147C29.0195 1.53077 29.099 1.8805 29.0929 2.23402C29.1009 4.32802 29.1049 6.42202 29.0929 8.51502C29.0997 8.8156 29.0446 9.11436 28.931 9.39272C28.8174 9.67108 28.6477 9.92309 28.4326 10.1331C28.2174 10.3431 27.9613 10.5066 27.6803 10.6134C27.3993 10.7202 27.0993 10.7681 26.7989 10.754C24.9796 10.7594 23.1603 10.7594 21.3409 10.754C21.1319 10.754 21.0619 10.798 21.0719 11.018C21.0909 11.447 21.0819 11.877 21.0719 12.307C21.0844 12.4976 21.0558 12.6886 20.9879 12.8671C20.9201 13.0456 20.8146 13.2074 20.6787 13.3416C20.5427 13.4757 20.3795 13.579 20.2001 13.6445C20.0207 13.71 19.8293 13.7361 19.6389 13.721C16.1283 13.721 12.6176 13.721 9.10695 13.721C9.02678 13.7161 8.94652 13.7291 8.87198 13.759C8.79744 13.7889 8.73048 13.8351 8.67595 13.894C8.09495 14.494 7.49994 15.071 6.91594 15.664C6.83482 15.7812 6.71688 15.868 6.58083 15.9106C6.44478 15.9532 6.29842 15.9491 6.16494 15.899C5.86494 15.769 5.83395 15.493 5.83695 15.206C5.83695 14.776 5.83095 14.346 5.83695 13.917C5.83695 13.76 5.79295 13.702 5.63695 13.723C5.57302 13.7274 5.50887 13.7274 5.44495 13.723C5.24356 13.7472 5.03931 13.7254 4.84755 13.6593C4.65579 13.5932 4.48149 13.4845 4.33773 13.3414C4.19397 13.1984 4.08449 13.0246 4.0175 12.8331C3.95051 12.6417 3.92776 12.4375 3.95094 12.236C3.95094 9.45669 3.95094 6.67702 3.95094 3.89702C3.92862 3.69772 3.95139 3.49595 4.01757 3.30663C4.08374 3.11731 4.19163 2.94529 4.33325 2.80328C4.47486 2.66128 4.64659 2.55293 4.83573 2.48624C5.02487 2.41956 5.22658 2.39624 5.42595 2.41802C8.35128 2.41802 11.2769 2.41802 14.2029 2.41802C14.4149 2.41802 14.4889 2.38802 14.4979 2.14902C14.5031 1.683 14.6593 1.23123 14.9431 0.861568C15.2269 0.49191 15.6231 0.224329 16.0719 0.0990234C16.1349 0.0780234 16.2209 0.0840234 16.2519 -0.000976562H27.2299ZM21.7979 9.65902H26.7329C26.9045 9.68229 27.079 9.66563 27.243 9.61035C27.407 9.55507 27.5561 9.46266 27.6785 9.34033C27.8009 9.21799 27.8935 9.06903 27.9489 8.90507C28.0043 8.7411 28.0211 8.56655 27.9979 8.39502C27.9979 6.38436 27.9979 4.37336 27.9979 2.36202C28.0209 2.19058 28.004 2.01614 27.9485 1.8523C27.893 1.68846 27.8005 1.53964 27.6781 1.41743C27.5556 1.29521 27.4067 1.20289 27.2427 1.14767C27.0788 1.09244 26.9044 1.07579 26.7329 1.09902H16.8619C16.6904 1.07576 16.5159 1.09242 16.3519 1.1477C16.1879 1.20298 16.0388 1.29539 15.9164 1.41772C15.794 1.54006 15.7014 1.68901 15.646 1.85298C15.5906 2.01695 15.5738 2.1915 15.5969 2.36302C15.5969 4.37369 15.5969 6.38469 15.5969 8.39602C15.574 8.56747 15.5909 8.74191 15.6464 8.90574C15.7019 9.06958 15.7944 9.2184 15.9168 9.34062C16.0393 9.46284 16.1882 9.55515 16.3521 9.61038C16.5161 9.66561 16.6905 9.68225 16.8619 9.65902H21.7969M6.94095 14.091C7.34895 13.679 7.71495 13.328 8.05895 12.957C8.16215 12.8424 8.28974 12.7523 8.43234 12.6935C8.57494 12.6346 8.72892 12.6085 8.88295 12.617C12.4496 12.6257 16.0163 12.6274 19.5829 12.622C19.9319 12.622 19.9769 12.576 19.9779 12.222C19.9779 11.81 19.9669 11.398 19.9829 10.987C19.9899 10.792 19.9319 10.745 19.7409 10.747C18.7719 10.757 17.8019 10.747 16.8329 10.747C16.5968 10.7525 16.3611 10.7242 16.1329 10.663C15.6514 10.5367 15.2275 10.2498 14.9312 9.84975C14.635 9.44967 14.4842 8.96044 14.5039 8.46302C14.4986 6.89902 14.4986 5.33502 14.5039 3.77102C14.5039 3.57102 14.4669 3.49702 14.2429 3.49902C12.7159 3.51002 11.1889 3.50502 9.66095 3.50502H5.46095C5.08795 3.50502 5.06094 3.53502 5.06094 3.91702C5.06094 4.18369 5.06094 4.45036 5.06094 4.71702C5.06094 7.22302 5.06094 9.72902 5.06094 12.235C5.06094 12.578 5.10094 12.618 5.43594 12.619C5.72894 12.619 6.02095 12.619 6.31395 12.619C6.39882 12.6086 6.48495 12.6177 6.56578 12.6456C6.64661 12.6735 6.72 12.7195 6.78037 12.7801C6.84074 12.8406 6.88649 12.9142 6.91415 12.9951C6.9418 13.076 6.95062 13.1622 6.93995 13.247C6.94595 13.499 6.93995 13.752 6.93995 14.087" fill="#A996DB" />
												<path d="M0.999967 20.579C1.09486 20.397 1.16226 20.2018 1.19997 20C1.41973 19.4095 1.81174 18.8986 2.32523 18.5334C2.83872 18.1683 3.45003 17.9657 4.07997 17.952C5.03097 17.933 5.97997 17.945 6.93297 17.952C7.10462 17.9522 7.27459 17.9182 7.43297 17.852C10.423 16.644 13.4143 15.439 16.407 14.237C16.5309 14.1794 16.6611 14.1364 16.795 14.109C16.877 14.0994 16.9602 14.1085 17.0382 14.1356C17.1162 14.1627 17.1871 14.2071 17.2455 14.2655C17.3039 14.3239 17.3483 14.3948 17.3754 14.4728C17.4025 14.5508 17.4116 14.634 17.402 14.716C17.402 15.941 17.41 17.167 17.402 18.392C17.3943 18.4365 17.3957 18.482 17.4062 18.5259C17.4166 18.5698 17.4358 18.6111 17.4626 18.6473C17.4894 18.6836 17.5233 18.714 17.5622 18.7368C17.6011 18.7596 17.6442 18.7743 17.689 18.78C18.1682 18.9489 18.5833 19.2623 18.8769 19.677C19.1705 20.0918 19.3282 20.5874 19.3282 21.0955C19.3282 21.6037 19.1705 22.0993 18.8769 22.514C18.5833 22.9288 18.1682 23.2422 17.689 23.411C17.445 23.487 17.396 23.591 17.398 23.824C17.41 25.013 17.404 26.201 17.403 27.39C17.403 27.99 17.072 28.222 16.514 27.999C13.714 26.877 10.914 25.7537 8.11397 24.629C8.03197 24.596 7.94897 24.566 7.84697 24.529C7.84697 24.992 7.84697 25.429 7.84697 25.868C7.82097 28.452 8.18697 28.068 5.60497 28.098C5.46797 28.098 5.33097 28.098 5.19397 28.098C4.71097 28.098 4.50697 27.898 4.50597 27.415C4.50597 26.427 4.50597 25.44 4.50597 24.452C4.50597 24.305 4.47897 24.245 4.31597 24.252C3.55572 24.2907 2.80698 24.0542 2.20683 23.586C1.60668 23.1177 1.19529 22.4489 1.04797 21.702C1.04097 21.665 1.03397 21.632 0.990967 21.622L0.999967 20.579ZM16.3 26.729V15.472C15.937 15.618 15.6 15.779 15.246 15.889C14.994 15.968 14.946 16.103 14.946 16.345C14.956 18.109 14.952 19.874 14.952 21.638C14.952 22.187 14.768 22.454 14.397 22.446C14.026 22.438 13.853 22.172 13.853 21.646C13.853 20.0187 13.853 18.3917 13.853 16.765V16.455C11.877 17.255 9.94497 18.036 8.00797 18.807C7.83797 18.875 7.85497 18.981 7.85497 19.107C7.85497 20.433 7.85497 21.758 7.85497 23.083C7.84259 23.1613 7.85995 23.2413 7.90363 23.3074C7.94731 23.3734 8.01414 23.4208 8.09097 23.44C9.40397 23.957 10.712 24.49 12.022 25.017C13.44 25.587 14.86 26.155 16.301 26.733M6.76097 21.1C6.76097 20.479 6.76097 19.857 6.76097 19.236C6.76097 19.102 6.73897 19.043 6.58497 19.045C5.77197 19.053 4.95797 19.03 4.14597 19.055C3.61021 19.0572 3.09651 19.2686 2.71432 19.6441C2.33214 20.0195 2.11169 20.5294 2.09997 21.065C2.08675 21.5921 2.27983 22.1035 2.63808 22.4903C2.99633 22.8772 3.49144 23.1088 4.01797 23.136C4.88197 23.194 5.75297 23.151 6.61797 23.16C6.78497 23.16 6.75497 23.06 6.75497 22.96C6.75497 22.3387 6.75497 21.7174 6.75497 21.096M5.60997 25.628C5.60997 26.028 5.60997 26.428 5.60997 26.828C5.60997 26.956 5.63897 27.004 5.77497 26.999C6.04797 26.989 6.32297 26.989 6.59597 26.999C6.72997 26.999 6.76397 26.957 6.76297 26.828C6.75763 26.028 6.75763 25.225 6.76297 24.419C6.76297 24.29 6.72997 24.243 6.59597 24.248C6.32297 24.257 6.04797 24.258 5.77497 24.248C5.63897 24.243 5.60797 24.292 5.60997 24.419C5.61697 24.819 5.60997 25.219 5.60997 25.619M17.41 22.319C17.6761 22.2106 17.8997 22.0184 18.0469 21.7716C18.1941 21.5248 18.257 21.2367 18.226 20.951C18.2095 20.7125 18.1235 20.4841 17.9784 20.2941C17.8333 20.104 17.6357 19.9608 17.41 19.882V22.319Z" fill="#A996DB" />
												<path d="M23.021 20.572C23.505 20.572 23.99 20.572 24.474 20.572C24.866 20.572 25.099 20.777 25.104 21.106C25.109 21.435 24.87 21.665 24.469 21.667C23.5003 21.673 22.5317 21.673 21.563 21.667C21.163 21.667 20.916 21.444 20.917 21.113C20.918 20.782 21.159 20.574 21.568 20.571C22.052 20.571 22.537 20.571 23.021 20.571" fill="#A996DB" />
												<path d="M20.5349 23.597C20.6224 23.597 20.7089 23.6153 20.7888 23.6508C20.8687 23.6863 20.9403 23.7381 20.9989 23.803C21.3359 24.137 21.6749 24.47 22.0049 24.81C22.0652 24.8592 22.1146 24.9204 22.1498 24.9898C22.1851 25.0591 22.2054 25.1351 22.2095 25.2128C22.2137 25.2905 22.2015 25.3682 22.1739 25.4409C22.1462 25.5136 22.1037 25.5797 22.0489 25.635C21.9949 25.6884 21.9304 25.73 21.8594 25.757C21.7884 25.784 21.7125 25.796 21.6367 25.792C21.5608 25.7881 21.4866 25.7683 21.4188 25.7341C21.351 25.6998 21.2911 25.6518 21.2429 25.593C20.8879 25.251 20.543 24.899 20.198 24.548C20.1125 24.4708 20.0539 24.3684 20.0307 24.2557C20.0075 24.1429 20.0209 24.0257 20.069 23.921C20.1063 23.8271 20.1705 23.7462 20.2536 23.6886C20.3367 23.631 20.4349 23.5991 20.5359 23.597" fill="#A996DB" />
												<path d="M22.177 16.923C22.1693 17.0893 22.0976 17.2463 21.977 17.361C21.648 17.691 21.322 18.025 20.987 18.348C20.9392 18.407 20.8796 18.4553 20.812 18.4901C20.7445 18.5248 20.6705 18.5451 20.5948 18.5497C20.519 18.5543 20.4431 18.5431 20.3719 18.5168C20.3006 18.4905 20.2356 18.4497 20.181 18.397C20.1255 18.3422 20.0822 18.2763 20.0539 18.2037C20.0255 18.131 20.0127 18.0532 20.0164 17.9753C20.0201 17.8974 20.0401 17.8212 20.0752 17.7515C20.1103 17.6819 20.1596 17.6204 20.22 17.571C20.551 17.23 20.888 16.895 21.229 16.564C21.3071 16.4792 21.4106 16.4219 21.5239 16.4006C21.6373 16.3793 21.7545 16.3953 21.858 16.446C21.9498 16.4885 22.0281 16.5556 22.0842 16.6397C22.1403 16.7239 22.1721 16.8219 22.176 16.923" fill="#A996DB" />
												<path d="M19.4239 5.36403C19.4239 4.67803 19.4239 3.99203 19.4239 3.30703C19.4048 3.19465 19.4207 3.07911 19.4694 2.97606C19.5181 2.873 19.5973 2.78741 19.6963 2.73087C19.7953 2.67434 19.9093 2.6496 20.0228 2.66C20.1363 2.67041 20.2439 2.71545 20.331 2.78903C21.5256 3.4737 22.7183 4.16203 23.9089 4.85403C24.0163 4.89333 24.109 4.96467 24.1745 5.05839C24.24 5.15211 24.2751 5.26369 24.2751 5.37803C24.2751 5.49237 24.24 5.60395 24.1745 5.69767C24.109 5.79139 24.0163 5.86273 23.9089 5.90203C22.7183 6.59469 21.5253 7.28303 20.3299 7.96703C20.2429 8.04061 20.1353 8.08565 20.0218 8.09605C19.9083 8.10645 19.7943 8.08171 19.6953 8.02518C19.5963 7.96865 19.5171 7.88306 19.4684 7.78C19.4197 7.67694 19.4038 7.5614 19.4229 7.44903C19.4229 6.75403 19.4229 6.05903 19.4229 5.36403M20.5309 4.17003V6.58603L22.6219 5.37703L20.5309 4.16903" fill="#A996DB" />
												<path d="M10.011 6.86001C9.14398 6.86001 8.27598 6.86001 7.41098 6.86001C7.23642 6.87385 7.06302 6.82176 6.92498 6.71402C6.85826 6.65245 6.808 6.57516 6.7788 6.4892C6.74959 6.40324 6.74236 6.31134 6.75777 6.22187C6.77318 6.1324 6.81074 6.04821 6.86702 5.97697C6.9233 5.90573 6.99651 5.84971 7.07998 5.81402C7.19215 5.77419 7.31116 5.75719 7.42999 5.76401H12.63C13.003 5.76401 13.23 5.90502 13.289 6.17302C13.313 6.26009 13.315 6.35174 13.2948 6.43978C13.2747 6.52781 13.233 6.60948 13.1736 6.67746C13.1141 6.74543 13.0387 6.7976 12.9542 6.82929C12.8696 6.86098 12.7785 6.87119 12.689 6.85901C11.794 6.86501 10.899 6.85901 10.005 6.85901" fill="#A996DB" />
												<path d="M8.98198 9.93301C8.45298 9.93301 7.92399 9.93301 7.39399 9.93301C6.98799 9.93301 6.74699 9.72601 6.74399 9.39001C6.74099 9.05401 6.98198 8.83901 7.38498 8.83801C8.46165 8.83801 9.53831 8.83801 10.615 8.83801C10.6927 8.828 10.7716 8.83458 10.8466 8.85733C10.9216 8.88007 10.9909 8.91847 11.0499 8.96997C11.109 9.02146 11.1564 9.0849 11.1891 9.15609C11.2219 9.22728 11.2391 9.3046 11.2398 9.38294C11.2404 9.46129 11.2244 9.53888 11.1929 9.61059C11.1613 9.6823 11.1149 9.7465 11.0567 9.79896C10.9985 9.85142 10.9299 9.89094 10.8553 9.91491C10.7807 9.93888 10.7018 9.94675 10.624 9.93801C10.077 9.93801 9.52898 9.93801 8.98198 9.93801" fill="#A996DB" />
												<path d="M12.7739 8.83803C12.8825 8.83725 12.9888 8.86882 13.0793 8.92874C13.1698 8.98866 13.2404 9.0742 13.282 9.17442C13.3237 9.27465 13.3346 9.38501 13.3132 9.49142C13.2918 9.59784 13.2393 9.69549 13.1622 9.77188C13.085 9.84827 12.9869 9.89995 12.8803 9.92032C12.7737 9.94068 12.6634 9.92881 12.5636 9.88621C12.4638 9.84362 12.3789 9.77225 12.3198 9.6812C12.2608 9.59014 12.2302 9.48355 12.2319 9.37503C12.2353 9.2328 12.2936 9.0974 12.3947 8.99727C12.4957 8.89713 12.6317 8.84006 12.7739 8.83803Z" fill="#A996DB" />
												<path d="M14.398 24.686C14.2559 24.6793 14.1216 24.6192 14.0219 24.5178C13.9222 24.4165 13.8644 24.2812 13.86 24.139C13.8634 23.992 13.925 23.8524 14.0313 23.7507C14.1377 23.6491 14.28 23.5938 14.427 23.597C14.5692 23.6033 14.7032 23.6652 14.8001 23.7694C14.897 23.8736 14.9491 24.0118 14.945 24.154C14.9398 24.2959 14.8802 24.4303 14.7786 24.5294C14.6769 24.6285 14.5409 24.6846 14.399 24.686" fill="#A996DB" />
											</svg>
										</div>
										<div className="create-box-text">
											<h4>Social</h4>
										</div>
									</div>
								</div>
								<div className="create-cta-box create-box-blk" style={{backgroundColor:tabber === "filter-cta"&&"#6440FB"}} data-filter="filter-cta" onClick={(e) => { validateTabberChange('filter-cta',true) }}>
									<div className="create-cta-box-count" style={{backgroundColor: (visited?.cta || userData?.visited?.cta) && '#71dd37'}}>{(visited?.cta || userData?.visited?.cta) ? <img src='assets/images/tick-svgrepo-com.svg' alt="" width={24} height={24} /> : '4' }</div>
									<div className="create-template-box-inner">
										<div className="create-box-icon">
											<svg width="26" height="36" viewBox="0 0 26 36" fill="none" xmlns="http://www.w3.org/2000/svg">	
												<path d="M10.393 35.283C10.0196 35.1574 9.63421 35.0713 9.24296 35.026C7.50254 34.5987 5.92163 33.6801 4.68854 32.3796C3.45546 31.0792 2.62218 29.4517 2.28796 27.691C2.18759 27.0748 2.13775 26.4514 2.13896 25.827C2.13896 24.064 2.19196 22.3 2.12496 20.539C2.09674 20.1615 2.16351 19.7829 2.31918 19.4378C2.47485 19.0928 2.71446 18.7922 3.01614 18.5635C3.31782 18.3348 3.67196 18.1853 4.04626 18.1286C4.42056 18.0719 4.8031 18.1099 5.15896 18.239C5.60549 18.3769 6.03085 18.5758 6.42296 18.83C6.42296 18.678 6.42296 18.571 6.42296 18.464C6.40996 16.464 6.39296 14.47 6.38596 12.473C6.36046 11.7366 6.40938 10.9996 6.53196 10.273C6.66104 9.73915 6.94466 9.25519 7.34734 8.88167C7.75003 8.50815 8.25391 8.26165 8.79596 8.17301C9.34395 8.08146 9.90673 8.15093 10.416 8.373C10.9253 8.59506 11.3591 8.96017 11.665 9.42401C11.9743 9.89148 12.1376 10.4404 12.134 11.001C12.134 11.96 12.134 12.92 12.134 13.879V14.238C12.7996 13.8528 13.5909 13.7478 14.334 13.946C14.7457 14.0526 15.1278 14.2514 15.4514 14.5274C15.775 14.8033 16.0317 15.1493 16.202 15.539C16.266 15.676 16.283 15.758 16.475 15.66C16.8689 15.4349 17.311 15.3075 17.7643 15.2885C18.2177 15.2695 18.6689 15.3595 19.0803 15.5508C19.4917 15.7422 19.8511 16.0294 20.1286 16.3884C20.4061 16.7474 20.5934 17.1677 20.675 17.614C20.688 17.668 20.702 17.721 20.723 17.802C21.1864 17.5626 21.7014 17.4407 22.223 17.447C22.9555 17.4652 23.6526 17.766 24.1685 18.2863C24.6843 18.8067 24.9791 19.5064 24.991 20.239C25.003 22.247 25.015 24.256 24.986 26.263C24.9218 28.4151 24.1122 30.4781 22.6955 32.0995C21.2788 33.7208 19.343 34.7998 17.219 35.152C17.019 35.182 16.803 35.142 16.624 35.274L10.393 35.283ZM7.84796 18.45C7.84796 20.882 7.84796 23.3153 7.84796 25.75C7.85261 25.8614 7.85027 25.9729 7.84096 26.084C7.82056 26.2457 7.74598 26.3957 7.62939 26.5096C7.5128 26.6234 7.36108 26.6944 7.19896 26.711C7.04202 26.7262 6.88454 26.6879 6.75205 26.6025C6.61956 26.517 6.51981 26.3893 6.46896 26.24C6.43464 26.0882 6.42085 25.9325 6.42796 25.777C6.41396 24.394 6.47596 23.01 6.37696 21.628C6.37484 21.1322 6.19463 20.6536 5.86919 20.2795C5.54375 19.9054 5.09473 19.6607 4.60396 19.59C3.91396 19.472 3.56396 19.767 3.56296 20.468C3.56296 22.253 3.56296 24.038 3.56296 25.823C3.56233 26.3695 3.60782 26.9151 3.69896 27.454C4.01929 29.1355 4.8793 30.6666 6.14853 31.8151C7.41775 32.9636 9.02694 33.6668 10.732 33.818C12.314 33.918 13.899 33.842 15.483 33.861C16.1189 33.8665 16.7537 33.8055 17.377 33.679C19.0108 33.3223 20.488 32.4529 21.5931 31.1977C22.6981 29.9424 23.3732 28.3669 23.52 26.701C23.647 24.551 23.556 22.396 23.563 20.243C23.5614 19.8751 23.4141 19.5229 23.1534 19.2633C22.8927 19.0037 22.5398 18.858 22.172 18.858C21.8001 18.8456 21.4385 18.9808 21.1661 19.2341C20.8937 19.4874 20.7325 19.8383 20.718 20.21C20.691 20.644 20.707 21.08 20.707 21.51C20.707 22.078 20.45 22.41 20.007 22.423C19.564 22.436 19.286 22.094 19.285 21.502C19.285 20.442 19.285 19.382 19.285 18.322C19.2929 18.0987 19.2621 17.8758 19.194 17.663C19.0829 17.3474 18.8642 17.081 18.5764 16.9104C18.2886 16.7398 17.9499 16.6759 17.6198 16.7299C17.2896 16.7839 16.9889 16.9524 16.7705 17.2058C16.552 17.4592 16.4297 17.7815 16.425 18.116C16.415 19.176 16.425 20.236 16.425 21.296C16.425 21.396 16.425 21.496 16.425 21.596C16.419 22.096 16.134 22.426 15.703 22.421C15.6021 22.4193 15.5028 22.3963 15.4114 22.3536C15.32 22.3109 15.2387 22.2495 15.1726 22.1733C15.1066 22.097 15.0573 22.0077 15.0281 21.9112C14.9989 21.8147 14.9903 21.7131 15.003 21.613C15.003 20.029 15.003 18.444 15.003 16.86C15.0241 16.6599 15.003 16.4576 14.9411 16.2662C14.8791 16.0748 14.7777 15.8984 14.6433 15.7487C14.509 15.5989 14.3447 15.479 14.1611 15.3967C13.9775 15.3144 13.7787 15.2715 13.5774 15.2709C13.3762 15.2703 13.1771 15.3119 12.993 15.393C12.8089 15.4742 12.6439 15.593 12.5086 15.742C12.3733 15.8909 12.2707 16.0665 12.2076 16.2576C12.1444 16.4486 12.1221 16.6508 12.142 16.851C12.142 18.2343 12.142 19.6177 12.142 21.001C12.142 21.235 12.15 21.47 12.142 21.701C12.142 21.7941 12.1236 21.8863 12.088 21.9723C12.0524 22.0583 12.0001 22.1365 11.9343 22.2023C11.8685 22.2682 11.7903 22.3204 11.7043 22.356C11.6183 22.3917 11.5261 22.41 11.433 22.41C11.3399 22.41 11.2477 22.3917 11.1616 22.356C11.0756 22.3204 10.9975 22.2682 10.9316 22.2023C10.8658 22.1365 10.8136 22.0583 10.7779 21.9723C10.7423 21.8863 10.724 21.7941 10.724 21.701C10.718 21.59 10.724 21.478 10.724 21.366C10.724 18.0187 10.724 14.6717 10.724 11.325C10.7279 11.1238 10.7111 10.9228 10.674 10.725C10.631 10.5252 10.5464 10.3367 10.4257 10.1717C10.305 10.0068 10.1509 9.86918 9.97337 9.76783C9.79587 9.66649 9.59901 9.6037 9.39562 9.58357C9.19222 9.56344 8.98687 9.58643 8.79296 9.65101C8.50854 9.75548 8.26436 9.94706 8.09522 10.1984C7.92607 10.4498 7.84059 10.7482 7.85096 11.051C7.85096 13.5177 7.85096 15.9843 7.85096 18.451" fill="#A996DB" />
												<path d="M-1.54664e-05 10.272C3.19591e-05 7.93804 0.879828 5.68985 2.46392 3.97578C4.04801 2.2617 6.21999 1.20771 8.54672 1.02398C10.8734 0.840257 13.1839 1.5403 15.0174 2.98451C16.8509 4.42873 18.0726 6.51097 18.439 8.81601C18.6347 10.0076 18.5915 11.2262 18.312 12.401C18.176 12.973 17.846 13.23 17.389 13.116C16.973 13.016 16.795 12.626 16.919 12.091C17.1776 10.9937 17.197 9.85364 16.9759 8.7482C16.7547 7.64276 16.2982 6.59788 15.6373 5.68459C14.9763 4.77129 14.1266 4.01098 13.1457 3.45532C12.1648 2.89966 11.0758 2.56167 9.95262 2.46434C8.82949 2.367 7.69856 2.51259 6.63669 2.89122C5.57483 3.26984 4.60692 3.87263 3.79874 4.65861C2.99057 5.44459 2.36107 6.39534 1.95302 7.44625C1.54498 8.49716 1.36796 9.62359 1.43398 10.749C1.4642 11.2274 1.53648 11.7023 1.64998 12.168C1.68402 12.2626 1.69811 12.3633 1.69137 12.4636C1.68462 12.564 1.65719 12.6618 1.61079 12.7511C1.56439 12.8403 1.50003 12.919 1.42176 12.9821C1.34349 13.0453 1.253 13.0915 1.15598 13.118C1.05545 13.143 0.950712 13.1462 0.84886 13.1272C0.747007 13.1083 0.65042 13.0676 0.565643 13.0081C0.480865 12.9485 0.409876 12.8714 0.357486 12.7821C0.305095 12.6927 0.272526 12.5931 0.261985 12.49C0.0768058 11.7655 -0.0112984 11.0197 -1.54664e-05 10.272Z" fill="#A996DB" />
												<path d="M9.28401 4.59301C10.0922 4.59199 10.8914 4.76287 11.6286 5.09431C12.3657 5.42575 13.024 5.91017 13.5596 6.51541C14.0953 7.12066 14.4961 7.8329 14.7354 8.60487C14.9748 9.37684 15.0473 10.1909 14.948 10.993C14.9357 11.1785 14.8508 11.3516 14.7117 11.4749C14.5726 11.5983 14.3906 11.6619 14.205 11.652C14.1097 11.6502 14.0159 11.6284 13.9295 11.5881C13.8432 11.5477 13.7663 11.4897 13.7037 11.4178C13.6411 11.346 13.5943 11.2618 13.5663 11.1707C13.5383 11.0796 13.5297 10.9836 13.541 10.889C13.6446 9.98664 13.4782 9.07382 13.063 8.26601C12.5985 7.3981 11.8491 6.71674 10.941 6.33665C10.033 5.95657 9.02168 5.90097 8.07742 6.17921C7.13315 6.45745 6.31359 7.05254 5.75672 7.8643C5.19985 8.67605 4.93968 9.65489 5.02001 10.636C5.02901 10.736 5.03801 10.836 5.04001 10.936C5.05781 11.121 5.00265 11.3057 4.88627 11.4507C4.7699 11.5956 4.60151 11.6894 4.41701 11.712C4.32575 11.7269 4.2324 11.7231 4.14271 11.7006C4.05301 11.6781 3.96885 11.6375 3.89542 11.5813C3.82199 11.5251 3.76083 11.4545 3.7157 11.3738C3.67057 11.2931 3.64243 11.204 3.633 11.112C3.52418 10.5291 3.52757 9.93069 3.64301 9.34901C3.86944 8.01801 4.5605 6.81042 5.59334 5.9409C6.62618 5.07138 7.93389 4.59626 9.28401 4.60001" fill="#A996DB" />
											</svg>
										</div>
										<div className="create-box-text">
											<h4>CTA's</h4>
										</div>
									</div>
								</div>
							</div>
							<div className="create-template-right tabber-content filter-template right">
								<div className="create-template-right-inner">
									<div className="create-template-categories animate__animated animate__fadeIn">
										<div className="choose-categories">
											<select onChange={handletemplateCategory}>
												<option name="choose-template" value="All">All</option>
												{
													stateCategories?.length > 0 &&
													stateCategories?.map(item => (
														<option name="choose-template" value={item.category}>{item.category}</option>
													))
												}
											</select>
										</div>
										<div className="choose-templates">
											{ swiperDisplay ? (
													<Swiper
														spaceBetween={30}
														slidesPerView={1}
														loop={true}
														onSwiper={(swiper) => { setTemplateSwiper(swiper) }}
														onSlideChange={() => {}}
														
													>
														{
															filteredTemplates?.length > 0 &&
															filteredTemplates?.map(item => (
																<SwiperSlide>
																	<div key={item._id} onClick={() => { chooseTemplate(item) }} style={{ padding: '0px', width: '100%', height: "auto" }} >
																		<div style={{ 
																			display: 'flex', 
																			alignItems: 'center', 
																			justifyContent: 'center', 
																			flexDirection: 'column', 
																			width: '100%', 
																			height: "auto",
																			position:'relative'
																			}}>
																			<div style={{position:'absolute', zIndex:'2', top:'0px', left:'0px', width:'100%', height:'100%', backgroundColor: item?._id === chosenTemplateData?._id ? 'rgba(0,0,0,0.2)':'transparent', display:'flex', alignItems:'center', justifyContent:'center', fontSize:"24px", color:'whitesmoke'}}>{item?._id === chosenTemplateData?._id ? 'Selected':''}</div>
																			{imageLoading && <Skeleton width='100%' height='100px' />}
																			<img style={{boxShadow: '0px 3px 4px 3px rgba(0, 0, 0, 0.25)'}} onLoad={() => { setImageLoading(false) }} className="img-generic" src={`${process.env.REACT_APP_BACKEND_URL}/templates/${item?.template_img}`} alt="" />
																		</div>
																	</div>
																</SwiperSlide>
															))
														}	
													</Swiper>
												) : 
												(
													<ul>
														{
															filteredTemplates?.length > 0 &&
															filteredTemplates?.map(item => (
																<li key={item._id} onClick={() => { chooseTemplate(item) }} style={{ padding: '0px', width: '100%', height: "auto" }} >
																	<div style={{ 
																		display: 'flex', 
																		alignItems: 'center', 
																		justifyContent: 'center', 
																		boxShadow: '0px 3px 4px 3px rgba(0, 0, 0, 0.25)', 
																		flexDirection: 'column', 
																		width: '100%', 
																		height: '100%',
																		position:'relative'
																		}}>
																			<div style={{position:'absolute', zIndex:'2', top:'0px', left:'0px', width:'100%', height:'100%', backgroundColor: item?._id === chosenTemplateData?._id ? 'rgba(0,0,0,0.2)':'transparent', display:'flex', alignItems:'center', justifyContent:'center', fontSize:"24px", color:'whitesmoke'}}>{item?._id === chosenTemplateData?._id ? 'Selected':''}</div>
																		{imageLoading && <Skeleton width='100%' height='55px' />}
																		<img onLoad={() => { setImageLoading(false) }} className="img-generic" src={`${process.env.REACT_APP_BACKEND_URL}/templates/${item?.template_img}`} alt="" />
																	</div>
																</li>
															))
														}
													</ul>
												)
											}

										</div>
									</div>
									<div className="create-template-details">
										<div className="template-detail-top">
											<div className="template-top-circle">
												<div className="template-circle-1"></div>
												<div className="template-circle-2"></div>
												<div className="template-circle-3"></div>
											</div>
											<div className="template-top-form">
												<form method="post" action="">
													<div className="template-form-to template-field">
														<label>To:</label>
														<input type="text" name="to" placeholder="your recipient" />
													</div>
													<div className="template-form-subject template-field">
														<label>Subject:</label>
														<input type="text" name="subject" placeholder="checkout my new email signature:" />
													</div>
												</form>
											</div>
											<div className="template-data-blk" id='template-data-blk-id' style={{ pointerEvents: 'none' }}>
												{
													sign_ref.current ? getSignature()
														:
														Object.keys(chosenTemplateData).length > 0 ?
															<Skeleton width="100%" height="239px" />
															:
															<div style={{ width: "100%", height: "239px", backgroundColor: 'rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px' }}>
																<img src="assets/images/help-svgrepo-com.svg" alt="chooseicon" style={{ width: '60px', height:'30px', margin: '0px' }} />
																<h5>Please select a template</h5>
															</div>
												}
											</div>
										</div>
										{/* <div className="template-some-variations">
								<div className="some-variations-heading page-mini-heading">
									<h4>Some Variations</h4>
								</div>
								<div className="some-variations-images"> */}
										{
											// chosenTemplateData?.data ? <>{/*We need to have images associated with the templates here in smaller size*/}</> 
											// :
											// <></>
										}


										{/* </div>
							</div> */}
										<div className="template-detail-btn">
											<a onClick={() => { validateTabberChange('filter-details', true); }} href="#" data-filter="filter-details" className="anchor-tabber site-btn-second">Feed Details</a>
										</div>
									</div>
								</div>
							</div>
							<div className="create-template-right tabber-content filter-details right">
								<div className="create-template-right-inner">
									<div className="create-template-categories  animate__animated animate__fadeIn login-form">
										<form method="post" action="">
											<div className="create-upload-file">
												{/* From here we will start entering the data */}
												<label>
													<span className="upload-file-icon">
														<img className="img-generic" src="assets/images/Upload-file-icon.svg" alt="Upload File Icon" />
													</span>
													<span>Drag & Drop your Profile Pic</span>
													<button type="button" onClick={(e) => { Object.keys(chosenTemplateData).length > 0 && showModal() }} style={{display:'none'}} name="upload" />
													<Modal  
														title="Image Upload" 
														style={{minWidth:'40%', maxWidth:'75%' }}
														open={isModalOpen} 
														onOk={handleOk} 
														onCancel={handleCancel}
														footer={[
															<Button key="back" style={{fontWeight:'500', backgroundColor:"#ececec",padding:"20px 34px",}} onClick={handleCancel}>
															  Cancel
															</Button>,
															<Button key="submit" style={{fontWeight:'500', backgroundColor:'#140342',padding:"20px 34px", color:"#fff"}} type="primary" onClick={handleOk}>
															  Submit
															</Button>
														]}
													>
														<div id="drop-zone-container" style={{display:'flex', flexDirection:'column', alignItems:"center", justifyContent:'start', gap:"10px"}}>
															{/* <label style={{borderRadius:"10px", width:'50%', backgroundColor:"#140342", color:"white", padding:"25px 100px", border:'none', outline:"none", fontSize:"18px"}}>
																<span className="upload-file-icon">
																	<img className="img-generic" src="assets/images/Upload-file-icon.svg" alt="Upload File Icon" />
																</span>
																<span>Drag & Drop your Profile Pic</span>
																<input 
																	type="file"  
																	onChange={handleImageCropper}
																	style={{display:'none'}}
																/>
															</label> */}
															<FileUploader
																multiple={false}
																handleChange={handleFileChange}
																name="file"
																classes="drop-zone"
																types={["JPEG", "JPG", "PNG"]}
															/>
															<div className="image-info-blk">
																<img src="assets/images/icons8-information.svg" width={24} height={24} alt="info icon" />
																<p>{`Please upload an image of size ${chosenTemplateData?.filler?.profileImage_size}`}</p>
															</div>
															{	cropperDimensions.width &&
																<h6 style={{fontWeight:'400'}}>{`Dimensions: ${cropperDimensions?.width}px - ${cropperDimensions?.height}px`}</h6>
															}
															{/* <Cropper
																cropmove={handleCropMove}
																ref={cropperRef}
																highlight={true}
																rotatable={true}
																scalable={true}
																zoomable={false}
																style={{ height: 'auto', width: "100%" }}
																zoomTo={0.5}
																initialAspectRatio={1}
																preview=".img-preview"
																src={src}
																viewMode={1}
																minCropBoxHeight={10}
																minCropBoxWidth={10}
																background={false}
																responsive={true}
																autoCropArea={1}
																checkOrientation={false} // https://github.com/fengyuanchen/cropperjs/issues/671
																guides={true}
															/> */}
															{src ? <div style={{width:'100%', height:'auto', display:"flex", justifyContent:'center'}}><ReactCrop 
																circularCrop={cricular} 
																ruleOfThirds={true} 
																aspect={1} 
																crop={crop} 
																onChange={c => setCrop(c)} 
															>
																<img src={src} onLoad={handleImageLoad} alt="Cropper Image Display" />
															</ReactCrop></div> : <img src="/assets/images/upload-image-placeholder.png" />}
															{/* <div style={{width:'75%', border:'2px solid red', position:'relative', height:'400px', backgroundColor:"#333"}}>
																<Cropper
																	image={src}
																	crop={crop}
																	zoom={zoom}
																	minZoom={0.1}
																	maxZoom={10}
																	zoomSpeed={0.2}
																	cropShape={'rect'}
																	aspect={1 / 1}
																	onCropChange={setCrop}
																	onZoomChange={setZoom}
																	onRotationChange={setRotation}
																	onCropComplete={onCropComplete}
																	cropSize={{width:parseInt(chosenTemplateData?.filler?.profileImage_size?.split(" ")?.join("")?.split("px")[0]), height:parseInt(chosenTemplateData?.filler?.profileImage_size?.split(" ")?.join("")?.split("px")[1])}}
																/>
															</div> */}
															{src && <div style={{width:'100%', padding:'5px 10px', display:'flex', alignItems:'center', justifyContent:'center', gap:'20px', paddingTop:'5px'}}>
																<Button style={{backgroundColor:"#ececec", boxShadow:"2px 2px 12px 0px rgba(0,0,0,0.23)"}} shape="rounded" onClick={handleCircularCrop} icon={<FaRegCircle color="#484848"/>}></Button>
																<Button style={{backgroundColor:"#ececec", boxShadow:"2px 2px 12px 0px rgba(0,0,0,0.23)"}} shape="rounded" onClick={handleSquareCrop} icon={<FaRegSquare color="#484848"/>}></Button>
															</div>}
														</div>
													</Modal>
												</label>
												<div className="image-info-blk">
													<img src="assets/images/icons8-information.svg" width={24} height={24} alt="info icon" />
													<p>{`Please upload an image of size ${chosenTemplateData?.filler?.profileImage_size}`}</p>
												</div>
											</div>
											<div className="create-name form-field">
												<label id='name-required-label' className="fieldset">Name</label>
												<input  
												style={{color:warning?.name?.status ? "red" : "#000"}}
												onFocus={(e) => { if(warning?.name?.status){
													setWarning(prev =>({...prev, name:{status:false, message:""}}))
													setUserData(prev =>({...prev, fullName:""}))
												} else {e.target.select()} }}
												 maxLength="40"  
												 value={warning?.name?.status ? warning?.name?.message :  
													(loggerData?.isLoggedIn && Object.values(loggerData?.userData)?.length > 0 && loggerData?.template_id) ? userData?.fullName||"" 
													: 
													userData?.fullName ? 
													userData?.fullName :
													userData?.fullName === "" ?
													userData?.fullName :
													initialValues?.fullName
												 } 
												 required id='name-required' onChange={(e) => { if (Object.keys(chosenTemplateData).length > 0) { setUserData(prev => ({ ...prev, fullName: e.target.value?.replace(/[^a-zA-Z ]/g, '')?.slice(0, 40) })); setLoggerData(prev => ({ ...prev, userData: { ...prev.userData, fullName: e.target.value?.slice(0, 40) } })) } }} type="text" name="name" autoComplete="off" />
											</div>
											<div className="create-job-title form-field" style={{display:chosenTemplateData ? chosenTemplateData?.filler?.designation ? "block":"none":"block"}}>
												<label className="fieldset">Job title</label>
												<input 
													id='designation-required'
													placeholder="For ex: Manager, CEO, Student" 
													style={{color:warning?.designation?.status ? "red" : "#000"}}
													onFocus={(e) => { if(warning?.designation?.status){
														setWarning(prev =>({...prev, designation:{status:false, message:""}}))
														setUserData(prev =>({...prev, designation:""}))
													} else {e.target.select()} }} 
													maxLength="30" 
													onChange={(e) => { if (Object.keys(chosenTemplateData).length > 0) { setUserData(prev => ({ ...prev, designation: e.target.value?.replace(/[^a-zA-Z ]/g, '')?.slice(0, 30) })); setLoggerData(prev => ({ ...prev, userData: { ...prev.userData, designation: e.target.value?.replace(/[^a-zA-Z ]/g, '')?.slice(0, 30) } })) } }} 
													value={warning?.designation?.status ? warning?.designation?.message : 
														(loggerData?.isLoggedIn && Object.values(loggerData?.userData)?.length > 0 && loggerData?.template_id) ? userData?.designation||"" 
														: 
														userData?.designation ? 
														userData?.designation :
														userData?.designation === "" ?
														userData?.designation :
														initialValues?.designation
													} 
													type="text" name="create-job-title" autoComplete="off" />
											</div>
											<div className="create-email form-field" style={{display:chosenTemplateData ? chosenTemplateData?.filler?.email ? "block":"none":"block"}}>
												<label className="fieldset">Email</label>
												<input  
												id='email-required'
												style={{color:warning?.email?.status ? "red" : "#000"}}
												onFocus={(e) => { if(warning?.email?.status){
													setWarning(prev =>({...prev, email:{status:false, message:""}}))
													setUserData(prev =>({...prev, email:""}))
												} else {e.target.select()} }} 
												maxLength="50" 
												onChange={(e) => { if (Object.keys(chosenTemplateData).length > 0) { setUserData(prev => ({ ...prev, email: e.target.value?.slice(0, 50) })); setLoggerData(prev => ({ ...prev, userData: { ...prev.userData, email: e.target.value?.slice(0, 50) } })) } }} 
												value={warning?.email?.status ? warning?.email?.message : 
													(loggerData?.isLoggedIn && Object.values(loggerData?.userData)?.length > 0 && loggerData?.template_id) ? userData?.email||"" 
													: 
													userData?.email ? 
													userData?.email :
													userData?.email === "" ?
													userData?.email :
													initialValues?.email
												}
												type="text" name="create-email" autoComplete="off" />
											</div>
											<div className="create-phone form-field" style={{display:chosenTemplateData ? chosenTemplateData?.filler?.phone ? "block":"none":"block"}}>
												<label className="fieldset">Phone</label>
												<input  onFocus={(e) => { e.target.select() }} maxLength="20" onChange={(e) => { if (Object.keys(chosenTemplateData).length > 0) { setUserData(prev => ({ ...prev, phone: e.target.value?.replace(/[^0-9!@#$%^&*()-_+=]/g, '')?.slice(0, 20) })); setLoggerData(prev => ({ ...prev, userData: { ...prev.userData, phone: e.target.value?.replace(/[^0-9!@#$%^&*()-_+=]/g, '')?.slice(0, 20) } })) } }} value={
												// logged in old user
												(loggerData?.isLoggedIn && Object.values(loggerData?.userData)?.length > 0 && loggerData?.template_id) ? userData?.phone||"" 
												: 
												userData?.phone ? 
												userData?.phone :
												userData?.phone === "" ?
												userData?.phone :
												initialValues?.phone
												} 
												type="text" name="create-phone" autoComplete="off" />
											</div>
											{/**
											 * WEBSITE DATA INPUT 
											 */}
											<div className="create-website form-field" style={{display:chosenTemplateData ? chosenTemplateData?.filler?.website ? "block":"none":"block"}}>
												<label className="fieldset">Website</label>
												<input  
													onFocus={(e) => { e.target.select() }} 
													maxLength="100" 
													onChange={(e) => { 
														if (Object.keys(chosenTemplateData).length > 0) { 
															setUserData(prev => ({ ...prev, website: e.target.value?.slice(0, 100) })); 
															setLoggerData(prev => ({ ...prev, userData: { ...prev.userData, website: e.target.value?.slice(0, 100) } })) } }} 
													value={ 
														(loggerData?.isLoggedIn && Object.values(loggerData?.userData)?.length > 0 && loggerData?.template_id) ? userData?.website||"" 
														: 
														userData?.website ? 
														userData?.website :
														userData?.website === "" ?
														userData?.website :
														initialValues?.website
													} 
													type="text" 
													name="create-website" 
													autoComplete="off" />
											</div>
											
											<div className="create-website form-field" style={{display:chosenTemplateData ? chosenTemplateData?.filler?.location ? "block":"none":"block"}}>
												<label className="fieldset">Address</label>
												<input  onFocus={(e) => { e.target.select() }} maxLength="100" onChange={(e) => { if (Object.keys(chosenTemplateData).length > 0) { setUserData(prev => ({ ...prev, location: e.target.value?.slice(0, 100) })); setLoggerData(prev => ({ ...prev, userData: { ...prev.userData, location: e.target.value?.slice(0, 100) } })) } }} 
												value={
													(loggerData?.isLoggedIn && Object.values(loggerData?.userData)?.length > 0 && loggerData?.template_id) ? userData?.location||"" 
													: 
													userData?.location ? 
													userData?.location :
													userData?.location === "" ?
													userData?.location :
													initialValues?.location
												} type="text" name="create-address" autoComplete="off" />
											</div>
										</form>
									</div>
									<div className="create-template-details">
										<div className="template-detail-top">
											<div className="template-top-circle">
												<div className="template-circle-1"></div>
												<div className="template-circle-2"></div>
												<div className="template-circle-3"></div>
											</div>
											<div className="template-top-form">
												<form method="post" action="">
													<div className="template-form-to template-field">
														<label>To:</label>
														<input type="text" name="to" placeholder="your recipient" />
													</div>
													<div className="template-form-subject template-field">
														<label>Subject:</label>
														<input type="text" name="to" placeholder="checkout my new email signature:" />
													</div>
												</form>
											</div>
											<div className="template-data-blk" style={{ pointerEvents: 'none' }}>
												{/* here instead of this image our html string will be parsed and rendered */}
												{
													sign_ref.current ? getSignature() /* <>{parse(sign_ref.current,options)}</> */
														:
														Object.keys(chosenTemplateData).length > 0 ?
															<Skeleton width="100%" height="239px" />
															:
															<div style={{ width: "100%", height: "239px", backgroundColor: 'rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px' }}>
																<img src="assets/images/help-svgrepo-com.svg" alt="chooseicon" style={{ width: '60px', margin: '0px' }} />
																<h5>Please select a template</h5>
															</div>
												}
											</div>
										</div>
										<div className="template-detail-btn">
											<a href="#" onClick={() => { validateTabberChange('filter-template', true) }} data-filter="filter-social" className="anchor-tabber site-btn-second-reverse">Back</a>
											<a href="#" onClick={() => { validateTabberChange('filter-social', true) }} style={{float:'right'}} data-filter="filter-social" className="anchor-tabber site-btn-second">{state?.chosen_draft_data ? 'Edit Social Media' : 'Put Social Media'}</a>
										</div>
									</div>
								</div>
							</div>
							<div className="create-template-right tabber-content filter-social right">
								<div className="create-template-right-inner">
									<div className="create-template-categories  animate__animated animate__fadeIn login-form">
										<form method="post" action="">
											<div className="create-name form-field contact-form-field checkboxed-input">
											<input type="checkbox" checked={socialChecker?.facebook} onChange={((e)=>{setSocialChecker(prev =>({...prev, facebook:e.target.checked}))})} className="checker" id="facebook-check" name="facebook-check" value="facebook-selected" />
											<label htmlFor="facebook-check" id="custom-facebook-check"></label>
												<label className="fieldset"><img className="img-generic" src="assets/images/form_facebook-icon.svg" alt="facebook-icon" /></label>
												<input placeholder="https://www.facebook.com/username"  
												onFocus={(e) => { e.target.select() }} 
												maxLength="100" 
												value={
													(loggerData?.isLoggedIn && Object.values(loggerData?.userData)?.length > 0 && loggerData?.template_id) ? userData?.facebook||"" 
													: 
													userData?.facebook ? 
													userData?.facebook :
													userData?.facebook === "" ?
													userData?.facebook :
													initialValues?.facebook
												} 
												className="social-link-check" 
												onChange={(e) => { 
													if (Object.keys(chosenTemplateData).length > 0) { 
														setUserData(prev => ({ ...prev, facebook: e.target.value?.slice(0, 100) }));
														setLoggerData(prev => ({ ...prev, userData: { ...prev.userData, facebook: e.target.value?.slice(0, 100) } })) 
														// if(validator.isURL(e.target.value.slice(0,100))){
														// 	setOneValidUrl(prev => ({...prev, facebook:true}));
														// } else {
														// 	setOneValidUrl(prev => ({...prev, facebook:false}));
														// }
													} 
												}} type="text" name="create-facebook" autoComplete="off" />
											</div>
											<div className="create-email form-field contact-form-field checkboxed-input">
											<input type="checkbox" checked={socialChecker?.instagram} className="checker" onChange={((e)=>{setSocialChecker(prev =>({...prev, instagram:e.target.checked}))})} id="instagram-check" name="instagram-check" value="instagram-selected" />
											<label htmlFor="instagram-check" id="custom-instagram-check"></label>
												<label className="fieldset"><img className="img-generic" src="assets/images/form-instagram-icon.svg" alt="instagram-icon" /></label>
												<input placeholder="https://www.instagram.com/username/" 
												onFocus={(e) => { e.target.select() }} 
												maxLength="100" 
												value={
													(loggerData?.isLoggedIn && Object.values(loggerData?.userData)?.length > 0 && loggerData?.template_id) ? userData?.instagram||"" 
													: 
													userData?.instagram ? 
													userData?.instagram :
													userData?.instagram === "" ?
													userData?.instagram :
													initialValues?.instagram
												}  
												className="social-link-check" 
												onChange={(e) => { 
													if (Object.keys(chosenTemplateData).length > 0) { 
														setUserData(prev => ({ ...prev, instagram: e.target.value?.slice(0, 100) })); 
														setLoggerData(prev => ({ ...prev, userData: { ...prev.userData, instagram: e.target.value?.slice(0, 100) } })) 
														// if(validator.isURL(e.target.value.slice(0,100))){
														// 	setOneValidUrl(prev => ({...prev, instagram:true}));
														// } else {
														// 	setOneValidUrl(prev => ({...prev, instagram:false}));
														// }
													}
												}} type="text" name="create-instagram" autoComplete="off" />
											</div>
											<div className="create-website form-field contact-form-field checkboxed-input">
												<input type="checkbox" checked={socialChecker?.twitter} className="checker" onChange={((e)=>{setSocialChecker(prev =>({...prev, twitter:e.target.checked}))})} id="twitter-check" name="twitter-check" value="twitter-selected" />
												<label htmlFor="twitter-check" id="custom-twitter-check"></label>
												<label className="fieldset"><img className="img-generic" src="assets/images/form-twitter-icon.svg" alt="twitter-icon" /></label>
												<input placeholder="https://twitter.com/username" onFocus={(e) => { e.target.select() }} maxLength="100" 
												value={
													(loggerData?.isLoggedIn && Object.values(loggerData?.userData)?.length > 0 && loggerData?.template_id) ? userData?.twitter||"" 
													: 
													userData?.twitter ? 
													userData?.twitter :
													userData?.twitter === "" ?
													userData?.twitter :
													initialValues?.twitter
												} 
												className="social-link-check" 
												onChange={(e) => { 
													if (Object.keys(chosenTemplateData).length > 0) { 
														setUserData(prev => ({ ...prev, twitter: e.target.value?.slice(0, 100) }));
														setLoggerData(prev => ({ ...prev, userData: { ...prev.userData, twitter: e.target.value?.slice(0, 100) } })) 
														// if(validator.isURL(e.target.value.slice(0,100))){
														// 	setOneValidUrl(prev => ({...prev, twitter:true}));
														// } else {
														// 	setOneValidUrl(prev => ({...prev, twitter:false}));
														// }
													} 
														}}
													type="text" name="create-twitter" autoComplete="off" />
											</div>
											<div className="create-company form-field contact-form-field checkboxed-input">
												<input type="checkbox" checked={socialChecker?.linkedin} className="checker" onChange={((e)=>{setSocialChecker(prev =>({...prev, linkedin:e.target.checked}))})} id="linkedin-check" name="linkedin-check" value="linkedin-selected" />
												<label htmlFor="linkedin-check" id="custom-linkedin-check"></label>
												<label className="fieldset"><img className="img-generic" src="assets/images/form-linkedin-icon.svg" alt="linkedin-icon" /></label>
												<input placeholder="https://www.linkedin.com/in/username" 
												onFocus={(e) => { e.target.select() }} maxLength="100" 
												value={
													(loggerData?.isLoggedIn && Object.values(loggerData?.userData)?.length > 0 && loggerData?.template_id) ? userData?.linkedIn||"" 
													: 
													userData?.linkedIn ? 
													userData?.linkedIn :
													userData?.linkedIn === "" ?
													userData?.linkedIn :
													initialValues?.linkedIn
												} 
												className="social-link-check" 
												onChange={(e) => { 
													if (Object.keys(chosenTemplateData).length > 0) { 
														setUserData(prev => ({ ...prev, linkedIn: e.target.value?.slice(0, 100) }));
														setLoggerData(prev => ({ ...prev, userData: { ...prev.userData, linkedIn: e.target.value?.slice(0, 100) } })) 
														// if(validator.isURL(e.target.value.slice(0,100))){
														// 	setOneValidUrl(prev => ({...prev, linkedIn:true}));
														// } else {
														// 	setOneValidUrl(prev => ({...prev, linkedIn:false}));
														// }
														} 
												}} type="text" name="create-linkedin" autoComplete="off" />
											</div>
											<div className="create-phone form-field contact-form-field checkboxed-input">
												<input type="checkbox" checked={socialChecker?.youtube} className="checker" onChange={((e)=>{setSocialChecker(prev =>({...prev, youtube:e.target.checked}))})} id="youtube-check" name="youtube-check" value="youtube-selected" />
												<label htmlFor="youtube-check" id="custom-youtube-check"></label>
												<label className="fieldset"><img className="img-generic" src="assets/images/form-youtube-icon.svg" alt="youtube-icon" /></label>
												<input  onFocus={(e) => { e.target.select() }} maxLength="100" placeholder="https://www.youtube.com/watch?v=VIDEO_ID" 
												value={
													(loggerData?.isLoggedIn && Object.values(loggerData?.userData)?.length > 0 && loggerData?.template_id) ? userData?.youtube||"" 
													: 
													userData?.youtube ? 
													userData?.youtube :
													userData?.youtube === "" ?
													userData?.youtube :
													initialValues?.youtube
												} 
												className="social-link-check" 
												onChange={(e) => { 
													if (Object.keys(chosenTemplateData).length > 0) { 
														setUserData(prev => ({ ...prev, youtube: e.target.value?.slice(0, 100) }));
														setLoggerData(prev => ({ ...prev, userData: { ...prev.userData, youtube: e.target.value?.slice(0, 100) } }))
														// if(validator.isURL(e.target.value.slice(0,100))){
														// 	setOneValidUrl(prev => ({...prev, youtube:true}));
														// } else {
														// 	setOneValidUrl(prev => ({...prev, youtube:false}));
														// }
													} 
														}}
													type="text" name="create-youtube" autoComplete="off" />
											</div>
											<div className="create-phone form-field contact-form-field checkboxed-input">
											<input type="checkbox" className="checker" checked={socialChecker?.skype} onChange={((e)=>{setSocialChecker(prev =>({...prev, skype:e.target.checked}))})} id="skype-check" name="skype-check" value="skype-selected" />
											<label htmlFor="skype-check" id="custom-skype-check"></label>
												<label className="fieldset"><img className="img-generic" width={30} height={30} src="assets/images/form-skype-icon.svg" alt="skype-icon" /></label>
												<input  onFocus={(e) => { e.target.select() }} placeholder="live:skype_id" maxLength="100" 
												value={
													(loggerData?.isLoggedIn && Object.values(loggerData?.userData)?.length > 0 && loggerData?.template_id) ? userData?.skype||"" 
													: 
													userData?.skype ? 
													userData?.skype :
													userData?.skype === "" ?
													userData?.skype :
													initialValues?.skype
												} 
												className="social-link-check" 
												onChange={(e) => { 
													if (Object.keys(chosenTemplateData).length > 0) { 
														setUserData(prev => ({ ...prev, skype: e.target.value?.slice(0, 100) }));
														setLoggerData(prev => ({ ...prev, userData: { ...prev.userData, skype: e.target.value?.slice(0, 100) } }))
														// if(validator.isURL(e.target.value.slice(0,100))){
														// 	setOneValidUrl(prev => ({...prev, youtube:true}));
														// } else {	
														// 	setOneValidUrl(prev => ({...prev, youtube:false}));
														// }
													} 
														}}
													type="text" name="create-skype" autoComplete="off" />
											</div>
											<div className="create-phone form-field contact-form-field checkboxed-input">
											<input type="checkbox" className="checker" checked={socialChecker?.whatsapp} onChange={((e)=>{setSocialChecker(prev =>({...prev, whatsapp:e.target.checked}))})} id="whatsapp-check" name="whatsapp-check" value="whatsapp-selected" />
											<label htmlFor="whatsapp-check" id="custom-whatsapp-check"></label>
												<label className="fieldset"><img className="img-generic" width={30} height={30} src="assets/images/form-whatsapp-icon.svg" alt="whatsapp-icon" /></label>
												<input  onFocus={(e) => { e.target.select() }} placeholder="1234567890" maxLength="100" 
												value={
													(loggerData?.isLoggedIn && Object.values(loggerData?.userData)?.length > 0 && loggerData?.template_id) ? userData?.whatsapp||"" 
													: 
													userData?.whatsapp ? 
													userData?.whatsapp :
													userData?.whatsapp === "" ?
													userData?.whatsapp :
													initialValues?.whatsapp
												} 
												className="social-link-check" 
												onChange={(e) => { 
													if (Object.keys(chosenTemplateData).length > 0) { 
														setWhatsAppUrl(`http://wa.me/${e.target.value}`)
														setUserData(prev => ({ ...prev, whatsapp: e.target.value?.slice(0, 100) }));
														setLoggerData(prev => ({ ...prev, userData: { ...prev.userData, whatsapp: e.target.value?.slice(0, 100) } }))
														// if(validator.isURL(e.target.value.slice(0,100))){
														// 	setOneValidUrl(prev => ({...prev, youtube:true}));
														// } else {
														// 	setOneValidUrl(prev => ({...prev, youtube:false}));
														// }
													} 
														}}
													type="text" name="create-skype" autoComplete="off" />
											</div>
											<div className="create-job-title form-field contact-form-field checkboxed-input">
											<input type="checkbox" className="checker" checked={socialChecker?.pinterest} onChange={((e)=>{setSocialChecker(prev =>({...prev, pinterest:e.target.checked}))})} id="pinterest-check" name="pinterest-check" value="pinterest-selected" />
											<label htmlFor="pinterest-check" id="custom-pinterest-check"></label>
											
												<label className="fieldset"><img className="img-generic" src="assets/images/form-pintrest-icon.svg" alt="pinterest-icon" /></label>
												<input  onFocus={(e) => { e.target.select() }} placeholder="https://www.pinterest.com/username/" maxLength="100" 
												value={
													(loggerData?.isLoggedIn && Object.values(loggerData?.userData)?.length > 0 && loggerData?.template_id) ? userData?.pinterest||"" 
													: 
													userData?.pinterest ? 
													userData?.pinterest :
													userData?.pinterest === "" ?
													userData?.pinterest :
													initialValues?.pinterest
												}  
												className="social-link-check" 
												onChange={(e) => { 
													if (Object.keys(chosenTemplateData).length > 0) { 
														setUserData(prev => ({ ...prev, pinterest: e.target.value?.slice(0, 100) })); 
														setLoggerData(prev => ({ ...prev, userData: { ...prev.userData, pinterest: e.target.value?.slice(0, 100) } })
														)
														// if(validator.isURL(e.target.value.slice(0,100))){
														// 	setOneValidUrl(prev => ({...prev, pinterest:true}));
														// } else {
														// 	setOneValidUrl(prev => ({...prev, pinterest:false}));
														// }
												} }} type="text" name="create-pintrest" autoComplete="off" />
											</div>
										</form>
									</div>
									<div className="create-template-details">
										<div className="template-detail-top">
											<div className="template-top-circle">
												<div className="template-circle-1"></div>
												<div className="template-circle-2"></div>
												<div className="template-circle-3"></div>
											</div>
											<div className="template-top-form">
												<form method="post" action="">
													<div className="template-form-to template-field">
														<label>To:</label>
														<input type="text" name="to" placeholder="your recipient" />
													</div>
													<div className="template-form-subject template-field">
														<label>Subject:</label>
														<input type="text" name="to" placeholder="checkout my new email signature:" />
													</div>
												</form>
											</div>
											<div className="template-data-blk" style={{ pointerEvents: 'none' }}>
												{/* <img className="img-generic" src="assets/images/Create_Detial_Img.jpg"/> */}
												{
													sign_ref.current ? getSignature()
														:
														Object.keys(chosenTemplateData).length > 0 ?
															<Skeleton width="100%" height="239px" />
															:
															<div style={{ width: "100%", height: "239px", backgroundColor: 'rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px' }}>
																<img src="assets/images/help-svgrepo-com.svg" alt="chooseicon" style={{ width: '60px', margin: '0px' }} />
																<h5>Please select a template</h5>
															</div>
												}
											</div>
										</div>
										<div className="template-detail-btn">
											<a href="#" onClick={() => { validateTabberChange('filter-details', true) }} data-filter="filter-cta" className="anchor-tabber site-btn-second-reverse">Back</a>
											<a href="#" onClick={() => { validateTabberChange('filter-cta', true) }} style={{float:'right'}} data-filter="filter-cta" className="anchor-tabber site-btn-second">{ state?.chosen_draft_data ? 'Edit CTAs' : 'Add CTA'}</a>
										</div>
									</div>
								</div>
							</div>
							<div className="create-template-right tabber-content filter-cta right">
								<div className="create-template-right-inner">
									<div className="create-template-categories animate__animated animate__fadeIn login-form">
										<Accordion onChange={handleCtaDisplay} allowZeroExpanded={true} style={{width:'100%'}} >
											{ctaCollapseItems.map((item) => (
												<AccordionItem key={item.key} uuid={item.label.split(" ").join("")}>
													<AccordionItemHeading>
														<AccordionItemButton style={{position:'relative'}}>
															<div>{item.label}</div>
															<div id={`arrow-${item.label.split(" ").join("")?.toLowerCase()}`} style={{position:'absolute', right:'10px', display:'flex', width:"30px", height:"30px",alignItems:'center', justifyContent:'center', fontSize:'24px', transition:'all 300ms ease'}}><MdKeyboardArrowDown /></div>
														</AccordionItemButton>
													</AccordionItemHeading>
													<AccordionItemPanel className="accordion__panel animate__animated animate__fadeInDown">
													{item.children}
													</AccordionItemPanel>
												</AccordionItem>
											))}
										</Accordion>
									</div>
									<div className="create-template-details">
										<div className="template-detail-top">
											<div className="template-top-circle">
												<div className="template-circle-1"></div>
												<div className="template-circle-2"></div>
												<div className="template-circle-3"></div>
											</div>
											<div className="template-top-form">
												<form method="post" action="">
													<div className="template-form-to template-field">
														<label>To:</label>
														<input type="text" name="to" placeholder="your recipient" />
													</div>
													<div className="template-form-subject template-field">
														<label>Subject:</label>
														<input type="text" name="to" placeholder="checkout my new email signature:" />
													</div>
												</form>
											</div>
											<div className="template-data-blk" style={{ pointerEvents: 'none' }}>
												{/* <img className="img-generic" src="assets/images/Create_Detial_Img.jpg"/> */}
												{
													sign_ref.current ? getSignature()
														:
														Object.keys(chosenTemplateData).length > 0 ?
															<Skeleton width="100%" height="239px" />
															:
															<div style={{ width: "100%", height: "239px", backgroundColor: 'rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px' }}>
																<img src="assets/images/help-svgrepo-com.svg" alt="chooseicon" style={{ width: '60px', margin: '0px' }} />
																<h5>Please select a template</h5>
															</div>
												}
											</div>
										</div>
										<div className="template-detail-btn" style={{display:'flex', alignItems:'center', justifyContent:'space-between', width:"100%"}}>
											
											<div className="template-detail-first-btn">
												{
													loggerData?.isLoggedIn ?
														<div style={{display:'flex', flexDirection:'column',alignItems:'start', gap:'20px'}}>
															<a href="#" style={{padding:"14px 35px", backgroundColor:'#fff',border:'1px solid #140342', borderRadius:'10px'}} onClick={() => { validateTabberChange('filter-social', true) }} data-filter="filter-cta" className="anchor-tabber ">Continue Editing</a>
															<div style={{padding:"14px 40px", fontWeight:'500', backgroundColor:'#fff', borderRadius:'10px',boxShadow:'4px 4px 12px 4px rgba(0,0,0,0.1)',lineHeight:'24px', display:'flex', alignItems:'center'}} onClick={handleSave} className=""><span>{ saving ? <BarLoader color="#625bf8" /> : 'Save Signature'}</span></div>
														</div>
														:
														<div style={{display:'flex', flexDirection:'column',alignItems:'start', gap:'20px'}}>
															<a href="#" style={{padding:"12px 25px", backgroundColor:'#fff', border:'1px solid #140342', borderRadius:'10px', display:'flex',alignItems:'center',gap:'10px' }} onClick={() => { validateTabberChange('filter-social', true) }} data-filter="filter-cta" className="anchor-tabber "><TiArrowBack style={{fontSize:'24px'}} /> <span>Continue Editing</span></a>
															<div style={{padding:"14px 40px", fontWeight:'500', backgroundColor:'#fff', borderRadius:'10px',boxShadow:'4px 4px 12px 4px rgba(0,0,0,0.1)', display:'flex', alignItems:'center'}} onClick={loginAndRedirect} className=""><span>Save Signature</span></div>
														</div>
												}
											</div>
											<div style={{display:'flex', alignItems:'start', justifyContent:'start', flexDirection:'column'}}>
												<div className="share-signature" style={{display:'flex', alignItems:'center', justifyContent:'flex-end', width:'auto', }} >
													<a style={{display:'none'}}></a>
													<a href="#" onClick={() => { copyWithStyle() }} id='copy-btn' className="site-btn">Copy Signature</a>
												</div>
												<div style={{display:'flex', alignItems:'center',justifyContent:'flex-end', marginTop:"15px", gap:"10px"}}>
													{/* <button style={{cursor:"pointer",backgroundColor:'#fff',border:'1px solid black', borderRadius:'10px', outline:'none', padding:"13px 35px", fontSize:'16px'}} >Setup Instructions</button>	 */}
													{/* <button onClick={copyTextPlain} style={{cursor:"pointer",backgroundColor:'#ececec', borderRadius:'10px', outline:'none', padding:"16px 35px", border:'none', fontSize:'16px'}} >Copy Source</button>	 */}
													<button onClick={handleGmailSignature} style={{cursor:"pointer",backgroundColor:'#fff',boxShadow:"4px 4px 12px 0px rgba(0,0,0,0.11)", borderRadius:'10px', outline:'none', padding:"13px 38px", border:'1px solid #ececec', fontSize:'15px', display:'flex', alignItems:'center',gap:"10px"}}>
														<FcGoogle style={{fontSize:"24px"}} />
														<p>{loggerData?.isLoggedIn ? 'Add to Gmail':"Login To continue"}</p>
													</button>	
												</div>
											</div>
											
										</div>
										
									</div>
								</div>
							</div>
						</div>
					</div>
				</section>
				<Footer loggerData={loggerData} />
			</>
		</ErrorBoundary>
	)
}

export default Create
