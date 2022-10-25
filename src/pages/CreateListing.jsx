import { useState, useEffect } from 'react'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase.config'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import Spinner from '../components/Spinner'
import { storeImage } from '../utils/storeImage'
import { getGeolocation } from '../utils/getGeolocation.js'

// FIX: move initial state outside of component so we can use it in useEffect
// without ignoring dependencies

const initialFormState = {
  type: 'rent',
  name: '',
  bedrooms: 1,
  bathrooms: 1,
  parking: false,
  furnished: false,
  location: '',
  offer: false,
  regularPrice: 0,
  discountedPrice: 0,
  images: {},
  latitude: 0,
  longitude: 0,
}

function CreateListing() {
  // NOTE: no need for unused useState setter here
  const geolocationEnabled = true

  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState(initialFormState)

  const {
    type,
    name,
    bedrooms,
    bathrooms,
    parking,
    furnished,
    location,
    offer,
    regularPrice,
    discountedPrice,
    latitude,
    longitude,
  } = formData

  const auth = getAuth()
  const navigate = useNavigate()

  useEffect(() => {
    // NOTE: onAuthStateChanged returns a unsubscribe function we can use for
    // cleanup from our useEffect. We then don't need a isMounted ref
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setFormData({ ...initialFormState, userRef: user.uid })
      } else {
        navigate('/sign-in')
      }
    })

    return unsubscribe
  }, [auth, navigate])

  const onSubmit = async (e) => {
    e.preventDefault()

    // remove images field and conditionally add discountedPrice
    const { images, discountedPrice, ...rest } = formData

    // FIX: discountedPrice and regularPrice will be of type Sring this will
    // fail
    if (+discountedPrice >= +regularPrice) {
      toast.error('Discounted price needs to be less than regular price')
      return
    }

    if (images.length > 6) {
      toast.error('Max 6 images')
      return
    }

    // NOTE: only set loading to true if validation passes
    setLoading(true)
    let geolocation = {}

    if (geolocationEnabled) {
      try {
        geolocation = await getGeolocation(location)
      } catch (error) {
        setLoading(false)
        toast.error(error)
      }
    } else {
      geolocation.lat = latitude
      geolocation.lng = longitude
    }

    const imgUrls = await Promise.all(
      [...images].map((image) => storeImage(auth.currentUser.uid, image))
    ).catch(() => {
      setLoading(false)
      toast.error('Images not uploaded')
      return
    })

    // NOTE: Firebase schema expects numbers for discountedPrice, regularPrice,
    // bedrooms and bathrooms so we need to convert the string value from inputs
    // to a number

    const formDataCopy = {
      ...rest,
      bedrooms: parseInt(bedrooms),
      bathrooms: parseInt(bathrooms),
      discountedPrice: parseInt(discountedPrice),
      regularPrice: parseInt(regularPrice),
      imgUrls,
      geolocation,
      timestamp: serverTimestamp(),
    }
    if (formData.offer) formDataCopy.discountedPrice = discountedPrice

    const docRef = await addDoc(collection(db, 'listings'), formDataCopy)
    setLoading(false)
    toast.success('Listing saved')
    navigate(`/category/${formDataCopy.type}/${docRef.id}`)
  }

  const onMutate = (e) => {
    // NOTE: simpler to have boolean inputs set state directly in their own
    // event handlers in JSX

    // Files
    if (e.target.files) {
      setFormData((prevState) => ({
        ...prevState,
        images: e.target.files,
      }))
      return
    }

    // Everything else except Parking, Furnished and Offer
    setFormData((prevState) => ({
      ...prevState,
      [e.target.id]: e.target.value,
    }))
  }

  if (loading) return <Spinner />

  return (
    <div className='profile'>
      <header>
        <p className='pageHeader'>Create a Listing</p>
      </header>

      <main>
        <form onSubmit={onSubmit}>
          <label className='formLabel'>Sell / Rent</label>
          <div className='formButtons'>
            <button
              type='button'
              className={type === 'sale' ? 'formButtonActive' : 'formButton'}
              id='type'
              value='sale'
              onClick={onMutate}
            >
              Sell
            </button>
            <button
              type='button'
              className={type === 'rent' ? 'formButtonActive' : 'formButton'}
              id='type'
              value='rent'
              onClick={onMutate}
            >
              Rent
            </button>
          </div>

          <label className='formLabel'>Name</label>
          <input
            className='formInputName'
            type='text'
            id='name'
            value={name}
            onChange={onMutate}
            maxLength='32'
            minLength='10'
            required
          />

          <div className='formRooms flex'>
            <div>
              <label className='formLabel'>Bedrooms</label>
              <input
                className='formInputSmall'
                type='number'
                id='bedrooms'
                value={bedrooms}
                onChange={onMutate}
                min='1'
                max='50'
                required
              />
            </div>
            <div>
              <label className='formLabel'>Bathrooms</label>
              <input
                className='formInputSmall'
                type='number'
                id='bathrooms'
                value={bathrooms}
                onChange={onMutate}
                min='1'
                max='50'
                required
              />
            </div>
          </div>

          <label className='formLabel'>Parking spot</label>
          <div className='formButtons'>
            <button
              className={parking ? 'formButtonActive' : 'formButton'}
              type='button'
              onClick={() => setFormData({ ...formData, parking: true })}
            >
              Yes
            </button>
            <button
              className={parking ? 'formButton' : 'formButtonActive'}
              type='button'
              onClick={() => setFormData({ ...formData, parking: false })}
            >
              No
            </button>
          </div>

          <label className='formLabel'>Furnished</label>
          <div className='formButtons'>
            <button
              className={furnished ? 'formButtonActive' : 'formButton'}
              type='button'
              value={true}
              onClick={() => setFormData({ ...formData, furnished: true })}
            >
              Yes
            </button>
            <button
              className={furnished ? 'formButton' : 'formButtonActive'}
              type='button'
              onClick={() => setFormData({ ...formData, furnished: false })}
            >
              No
            </button>
          </div>

          <label className='formLabel'>Address</label>
          <textarea
            className='formInputAddress'
            type='text'
            id='location'
            value={location}
            onChange={onMutate}
            required
          />

          {!geolocationEnabled && (
            <div className='formLatLng flex'>
              <div>
                <label className='formLabel'>Latitude</label>
                <input
                  className='formInputSmall'
                  type='number'
                  id='latitude'
                  value={latitude}
                  onChange={onMutate}
                  required
                />
              </div>
              <div>
                <label className='formLabel'>Longitude</label>
                <input
                  className='formInputSmall'
                  type='number'
                  id='longitude'
                  value={longitude}
                  onChange={onMutate}
                  required
                />
              </div>
            </div>
          )}

          <label className='formLabel'>Offer</label>
          <div className='formButtons'>
            <button
              className={offer ? 'formButtonActive' : 'formButton'}
              type='button'
              onClick={() => setFormData({ ...formData, offer: true })}
            >
              Yes
            </button>
            <button
              className={offer ? 'formButton' : 'formButtonActive'}
              type='button'
              onClick={() => setFormData({ ...formData, offer: false })}
            >
              No
            </button>
          </div>

          <label className='formLabel'>Regular Price</label>
          <div className='formPriceDiv'>
            <input
              className='formInputSmall'
              type='number'
              id='regularPrice'
              value={regularPrice}
              onChange={onMutate}
              min='50'
              max='750000000'
              required
            />
            {type === 'rent' && <p className='formPriceText'>$ / Month</p>}
          </div>

          {offer && (
            <>
              <label className='formLabel'>Discounted Price</label>
              <input
                className='formInputSmall'
                type='number'
                id='discountedPrice'
                value={discountedPrice}
                onChange={onMutate}
                min='50'
                max='750000000'
                required={offer}
              />
            </>
          )}

          <label className='formLabel'>Images</label>
          <p className='imagesInfo'>
            The first image will be the cover (max 6).
          </p>
          <input
            className='formInputFile'
            type='file'
            id='images'
            onChange={onMutate}
            max='6'
            accept='.jpg,.png,.jpeg,.avif,.webp'
            multiple
            required
          />
          <button type='submit' className='primaryButton createListingButton'>
            Create Listing
          </button>
        </form>
      </main>
    </div>
  )
}

export default CreateListing
