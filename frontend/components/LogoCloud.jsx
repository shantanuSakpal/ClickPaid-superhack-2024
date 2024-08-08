import Slider from 'react-infinite-logo-slider'

const LogoCloud = () => {
    return (
        <Slider
            width="220px"
            duration={60}
            pauseOnHover={false}
            blurBorders={false}
            blurBoderColor={'#fff'}
        >
            <Slider.Slide className='flex items-center max-w-[30vh]'>
                <img src="/chain/base.jpeg" alt="Base Chain" className='w-12 h-12 rounded-full mr-1' />
                <span className='text-black text-xl font-semibold'>Base</span>
            </Slider.Slide>
            <Slider.Slide className='flex items-center max-w-[30vh]'>
                <img src="/chain/metal-L2.png" alt="Metal L2" className='w-12 h-12 rounded-full mr-4' />
                <span className='text-black text-xl font-semibold'>Metal L2</span>
            </Slider.Slide>
            <Slider.Slide className='flex items-center max-w-[30vh]'>
                <img src="/chain/mode.png" alt="Mode" className='w-12 h-12 rounded-full mr-4' />
                <span className='text-black text-xl font-semibold'>Mode</span>
            </Slider.Slide>

            <Slider.Slide className='flex items-center max-w-[30vh]'>
                <img src="/chain/optimism.jpeg" alt="Optimism" className='w-12 h-12 rounded-full mr-4' />
                <span className='text-black text-xl font-semibold'>Optimism</span>
            </Slider.Slide>
            <Slider.Slide className='flex items-center'>
                <img src="/chain/worldcoin.png" alt="WorldCoin" className='w-12 h-12 rounded-full mr-4' />
                <span className='text-black text-xl font-semibold'>WorldCoin</span>
            </Slider.Slide>
    
        </Slider>
    )
}

export default LogoCloud
