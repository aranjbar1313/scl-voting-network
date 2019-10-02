'use strict'

/**
 *  give a vote on a specific day
 *  @param {com.scl.votingnetwork.MakeVote} tx - the MakeVote transaction
 * @transaction
 */
async function makeVote(tx) {
    // Check if the vote value is valid 
    validVote = tx.day.options.find((option) => {
        if (option === tx.vote.vote) {
            return true
        }
        return false
    })
    if (!validVote) {
        throw new Error('Your vote is not valid')
    }
	const processVote = async (tx) => {
        if (tx.day.votes) {
            // If list is not empty determine vote index to check if he/she has already voted.
            const voteIndex = tx.day.votes.findIndex((vote) => {
                if (vote.voter === tx.vote.voter) {
                    return vote
                }
            })
    
            if (voteIndex < 0) {
                // If the vote hasn't votes yet add the vote to the list.
                tx.day.votes.push(tx.vote)
            } else {
                // If the vote has already voted then update it.
                tx.day.votes[voteIndex] = tx.vote
            }
        } else {
            // If the list is empty create a list with the newly voted user.
            tx.day.votes = [tx.vote]
        }
    
        // Update vote registry
        const assetRegistry = await getAssetRegistry('com.scl.votingnetwork.Day')
        await assetRegistry.update(tx.day)
    }

  	return getParticipantRegistry('com.scl.votingnetwork.Personnel').then((personnel) => {
    	return personnel.exists(tx.vote.voter.getIdentifier())
    }).then((personnelExist) => {
    	if(!personnelExist){
        	throw new Error('Invalid user ID')
        } else {
            processVote(tx)
        }
    }).catch((err) => {
        console.log(err)
        throw new Error('Invalid user ID')
    })
}

/**
 * Delete All votes from registry
 * @param {com.scl.votingnetwork.DeleteAllVotes} tx - the DeleteAllVotes transaction
 * @transaction
 */
async function deleteAllVotes(tx) {
    tx.day.votes = []
    const dayRegistry = await getAssetRegistry('com.scl.votingnetwork.Day')
    await dayRegistry.update(tx.day)
}

/**
 * Counting votes
 * @param {com.scl.votingnetwork.CountingVotes} tx - the CountingVotes transaction
 * @transaction
 */
async function countingVotes(tx) {
    console.log('Counting Votes')
    const day = tx.day
    const options = day.options
    const votes = {}
    options.forEach((option) => {
        votes['option' + option] = 0
    })
    day.votes.forEach((vote) => {
        options.find((option) => {
            if (option === vote.vote) {
                votes['option' + option] += 1
            }
        })
    })

    const factory = getFactory()
    const voteCount = factory.newResource('com.scl.votingnetwork', 'VoteCount', tx.day.date)
    const count = []
    for (i = 0; i < options.length; i++) {
        // console.log(votes['option' + String(i + 1)])
        count.push(votes['option' + String(i + 1)])
    }
    console.log(count)
    voteCount.count = count
    const dayRegistry = await getAssetRegistry('com.scl.votingnetwork.VoteCount')
    await dayRegistry.add(voteCount)
    console.log(votes)
}

/** 
 *  Initialize some test assets and participants useful for running a demo.
 * @param {com.scl.votingnetwork.SetupDemo} setupDemo - the SetupDemo transaction
 * @transaction
*/
async function setupDemo(tx) {
    const factory = getFactory()
    const NS = 'com.scl.votingnetwork'
    const personnelsNumber = tx.personnelsNumber
    const optionsNumber = tx.optionsNumber

    const getAllPersonnel = async () => {
        return getParticipantRegistry(NS + '.Personnel').then((personnelRegistry) => {
            return personnelRegistry.getAll();
        }).then((personnels) => {
            return personnels
        })
    }

    const emptyPersonnelRegistry = async (personnels) => {
        return getParticipantRegistry(NS + '.Personnel').then((personnelRegistry) => {
            return personnelRegistry.removeAll(personnels)
        })
    }

    const personnels = await getAllPersonnel()
    await emptyPersonnelRegistry(personnels)

    // Create the Personnel Ali
    // const ali = factory.newResource(NS, 'Personnel', 'ranjbar.ali@ut.ac.ir')
    // ali.fullName = 'Ali Ranjbar'

    // Create the Personnel Habib
    // const habib = factory.newResource(NS, 'Personnel', 'habib.yajam@gmail.com')
    // habib.fullName = 'Habib Yajam'

    // Create corps of personnels
    let baseId = 55510
    const personnelRegistry = await getParticipantRegistry(NS + '.Personnel')
    for (i = 0; i < personnelsNumber; i++) {
        const newPersonnel = factory.newResource(NS, 'Personnel', String(baseId + i + 1))
        await personnelRegistry.add(newPersonnel)
    }

    // Create a day
    const options = new Array(optionsNumber)
    for (i = 0; i < optionsNumber; i++) {
        options[i] = i + 1;
    }
    const today = factory.newResource(NS, 'Day', tx.date)
    today.options = options

    // Add today to the registry
    const dayRegistry = await getAssetRegistry(NS + '.Day')
    await dayRegistry.add(today)
}
