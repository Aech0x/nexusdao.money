import type { NextPage } from "next"
import { useSelector } from "react-redux"
import { RootState } from "../store"
import { useEffect, useState } from "react"
import { useDispatch } from "react-redux"

import Card from "../components/Card"
import Countdown from "react-countdown"
import Spinner from "../components/Spinner"

import { MinusIcon, PlusIcon } from "@heroicons/react/outline"
import { Status } from "../helpers/state"

const Presale: NextPage = () => {
  const {
    maxSold,
    privateSalePrice,
    privateSaleLimit,
    publicSalePrice,
    publicSaleLimit,
    isAnnounced,
    startTime,
    endTime,
    isPublicSale,
    isClaimable,
    canClaimOnceIn,
    claimablePerDay,
    totalSold
  } = useSelector((state: RootState) => state.presale.global)

  const dispatch = useDispatch()

  const { connected, isValidNetwork } = useSelector(
    (state: RootState) => state.web3
  )
  const { isWhitelisted, invested, mimApprovedAmount, lastClaimedAt } =
    useSelector((state: RootState) => state.presale.user)
  const status = useSelector((state: RootState) => state.presale.status)

  const [hasStarted, setHasStarted] = useState(false)
  const [hasEnded, setHasEnded] = useState(false)
  const [buyAmount, setBuyAmount] = useState(100)

  const [currentLimit, setCurrentLimit] = useState(500)
  const [currentPrice, setCurrentPrice] = useState(1)

  useEffect(() => {
    const now = Date.now() / 1000
    if (startTime != 0 && now > startTime) setHasStarted(true)
    if (endTime != 0 && now > endTime) setHasEnded(true)
  }, [startTime, endTime, hasStarted])

  useEffect(() => {
    setCurrentLimit(isPublicSale ? publicSaleLimit : privateSaleLimit)
    setCurrentPrice(isPublicSale ? publicSalePrice : privateSalePrice)
  }, [
    isPublicSale,
    publicSaleLimit,
    privateSaleLimit,
    privateSalePrice,
    publicSalePrice
  ])

  return (
    <>
      {status.global !== Status.Success ? (
        <div className="flex flex-col flex-auto items-center justify-center mb-24">
          <Spinner />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-20">
          {hasEnded ? null : (
            <Card
              title={
                isAnnounced
                  ? hasStarted
                    ? "Presale Ends In"
                    : "Presale Starts In"
                  : "Presale Starts In"
              }
            >
              <span className="text-2xl font-bold">
                {isAnnounced ? (
                  hasStarted ? (
                    <Countdown
                      key={1}
                      date={new Date(endTime * 1000)}
                      onComplete={() => {
                        setHasEnded(true)
                      }}
                    />
                  ) : (
                    <Countdown
                      key={2}
                      date={new Date(startTime * 1000)}
                      onComplete={() => {
                        setHasStarted(true)
                      }}
                    />
                  )
                ) : (
                  "TBA"
                )}
              </span>
            </Card>
          )}

          {connected && isValidNetwork && !isPublicSale ? (
            <Card title="WL Status">
              <span
                className={`text-2xl font-bold ${
                  isWhitelisted ? "text-green-600" : "text-red-600"
                }`}
              >
                {isWhitelisted ? "Whitelisted" : "Not whitelisted"}
              </span>
            </Card>
          ) : null}

          <Card title="Total Sold" value={totalSold.toFixed(2)} />
          <Card
            title="Remaining Tokens"
            value={(maxSold - totalSold).toFixed(2)}
          />

          {hasEnded ? null : (
            <Card
              title={`Current Price (${
                isPublicSale ? "public sale" : "private sale"
              })`}
              value={`${isPublicSale ? publicSalePrice : privateSalePrice} MIM`}
            />
          )}

          {connected && isValidNetwork ? (
            <div className="flex items-center justify-center rounded-lg py-4 px-4 bg-white drop-shadow-md">
              <div className="flex flex-col items-center">
                <span className="text-lg font-semibold text-gray-500">
                  Your Presale Balance
                </span>
                <span className="text-2xl font-bold">
                  {invested.toFixed(2)}
                </span>
              </div>

              {isClaimable &&
              invested > 0 &&
              Date.now() / 1000 > lastClaimedAt + canClaimOnceIn ? (
                <button
                  className="ml-6 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                  onClick={() => {
                    dispatch({ type: "presale/claimTokens" })
                  }}
                >
                  {`Claim ${(invested > claimablePerDay
                    ? claimablePerDay
                    : invested
                  ).toFixed(2)}`}
                </button>
              ) : null}
            </div>
          ) : null}

          {connected && isValidNetwork && isClaimable && invested > 0 ? (
            <Card title="Claim Again In">
              <span className="text-2xl font-bold">
                <Countdown
                  date={new Date((lastClaimedAt + canClaimOnceIn) * 1000)}
                />
              </span>
            </Card>
          ) : null}

          {!isClaimable && !hasEnded ? (
            <Card title="Buy Tokens">
              <div className="flex items-center mt-2">
                {mimApprovedAmount < publicSaleLimit * publicSalePrice ? (
                  <button
                    className="py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg ml-2"
                    onClick={() => {
                      dispatch({ type: "presale/approveMim" })
                    }}
                  >
                    Approve MIM
                  </button>
                ) : (
                  <>
                    <div className="flex flex-col">
                      <div className="flex">
                        <button
                          className="p-2 bg-gray-200 hover:bg-gray-300 cursor-pointer rounded-l-lg"
                          title="Decrement Buy Amount"
                          onClick={() => {
                            setBuyAmount(buyAmount - 1)
                          }}
                        >
                          <MinusIcon className="h-6 w-6" />
                        </button>
                        <input
                          type="number"
                          value={buyAmount}
                          className="outline-none focus:outline-none bg-gray-100 text-center text-lg font-semibold"
                          onChange={(e) => {
                            if (e.target.value === String()) setBuyAmount(0)
                            else {
                              e.target.value = parseInt(e.target.value).toFixed(
                                0
                              )
                              setBuyAmount(parseInt(e.target.value))
                            }
                          }}
                        />
                        <button
                          className="p-2 bg-gray-200 hover:bg-gray-300 cursor-pointer rounded-r-lg"
                          title="Decrement Buy Amount"
                          onClick={() => {
                            setBuyAmount(buyAmount + 1)
                          }}
                        >
                          <PlusIcon className="h-6 w-6" />
                        </button>
                      </div>
                      <button
                        disabled={
                          buyAmount + invested > currentLimit || buyAmount < 1
                        }
                        className={`py-2 px-3 ${
                          buyAmount + invested > currentLimit || buyAmount < 1
                            ? "bg-red-600 hover:bg-red-700 cursor-not-allowed"
                            : "bg-blue-600 hover:bg-blue-700"
                        } text-white rounded-lg mt-2`}
                        onClick={() => {
                          dispatch({
                            type: "presale/buyTokens",
                            payload: buyAmount
                          })
                        }}
                      >
                        {buyAmount < 1
                          ? "Cannot buy < 1"
                          : buyAmount + invested > currentLimit
                          ? `Cannot buy > ${currentLimit}`
                          : `Buy with ${buyAmount * currentPrice} MIM`}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </Card>
          ) : null}
        </div>
      )}
    </>
  )
}

export default Presale
